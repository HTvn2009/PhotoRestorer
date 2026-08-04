const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, 'public');
const PORT = Number(process.env.PORT || 3000);
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const MIME_TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const descriptionSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    category: { type: 'string', enum: ['historical', 'cultural', 'artifact', 'landmark', 'people', 'general'] },
    observedDetails: { type: 'array', items: { type: 'string' } },
    identification: { type: 'object', additionalProperties: false, properties: { candidate: { type: 'string' }, confidence: { type: 'string', enum: ['low', 'medium', 'high'] }, reason: { type: 'string' } }, required: ['candidate', 'confidence', 'reason'] },
    description: { type: 'string' },
    historicalContext: { type: 'string' },
    warnings: { type: 'array', items: { type: 'string' } },
    humanCheck: { type: 'boolean' },
    sourceSearchRecommended: { type: 'boolean' }
  },
  required: ['category', 'observedDetails', 'identification', 'description', 'historicalContext', 'warnings', 'humanCheck', 'sourceSearchRecommended']
};

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    request.on('data', chunk => {
      size += chunk.length;
      if (size > Math.ceil(MAX_IMAGE_BYTES * 1.4)) {
        reject(new Error('Image is too large. The limit is 3 MB.'));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    request.on('error', reject);
  });
}

async function restore(request, response) {
  if (!process.env.OPENAI_API_KEY) return sendJson(response, 503, { error: 'OPENAI_API_KEY is not configured on the server. See README.md to enable AI.' });
  try {
    const payload = JSON.parse(await readBody(request));
    const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(payload.image || '');
    if (!match) return sendJson(response, 400, { error: 'Only valid JPG, PNG, or WEBP images are accepted.' });
    const bytes = Buffer.from(match[2], 'base64');
    if (bytes.length > MAX_IMAGE_BYTES) return sendJson(response, 413, { error: 'Image exceeds the 3 MB limit.' });
    const extension = match[1] === 'image/jpeg' ? 'jpg' : match[1].split('/')[1];
    const image = new Blob([bytes], { type: match[1] });
    const form = new FormData();
    form.append('model', 'gpt-image-2');
    form.append('image', image, `source.${extension}`);
    form.append('size', 'auto');
    form.append('quality', 'medium');
    form.append('output_format', 'png');
    form.append('prompt', `Restore this uploaded photograph with high fidelity. It may be an old, blurry, faded, damaged, black-and-white, historical, or traditional cultural image. Upscale it, improve sharpness and clarity, reduce noise and artifacts, and colorize naturally when the source is monochrome. Preserve the original subject identity, composition, facial features, period clothing, architecture, traditional artifacts, text, and cultural context. Do not invent people, objects, symbols, lettering, landmarks, or historical claims. Use conservative, plausible period-appropriate color when exact colors are unknowable. ${payload.title ? `Image title: ${String(payload.title).slice(0, 120)}.` : ''}`);
    const aiResponse = await fetch('https://api.openai.com/v1/images/edits', { method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: form });
    const aiResult = await aiResponse.json();
    if (!aiResponse.ok) return sendJson(response, aiResponse.status, { error: aiResult?.error?.message || 'The AI service could not process the image.' });
    const imageBase64 = aiResult?.data?.[0]?.b64_json;
    if (!imageBase64) return sendJson(response, 502, { error: 'The AI service did not return a restored image.' });
    return sendJson(response, 200, { imageBase64, mimeType: 'image/png' });
  } catch (error) {
    console.error('Restore error:', error);
    return sendJson(response, 500, { error: error.message || 'An internal error occurred while restoring the image.' });
  }
}

async function describe(request, response) {
  if (!process.env.OPENAI_API_KEY) return sendJson(response, 503, { error: 'OPENAI_API_KEY is not configured on the server.' });
  try {
    const payload = JSON.parse(await readBody(request));
    const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(payload.image || '');
    if (!match) return sendJson(response, 400, { error: 'Only valid JPG, PNG, or WEBP images are accepted.' });
    if (Buffer.from(match[2], 'base64').length > MAX_IMAGE_BYTES) return sendJson(response, 413, { error: 'Image exceeds the 3 MB limit.' });
    const title = String(payload.title || '').slice(0, 120);
    const userContext = String(payload.context || '').slice(0, 600);
    const instructions = 'You analyze photographs for a cultural and historical photo-restoration product. Respond in English using the supplied JSON schema. First classify the image. Describe only visual evidence visible in the original image. Do not identify a person, origin, date, location, event, artifact, landmark, or cultural tradition as fact unless directly supported by visible evidence or user-provided context. For uncertain identification, use cautious wording, set low or medium confidence, add a warning, and set humanCheck to true. For non-famous people, never infer identity, private information, or sensitive traits. Do not invent sources, citations, stories, text, symbols, or historical claims. sourceSearchRecommended may be true for a plausible historical, cultural, artifact, or landmark candidate, but no source is verified in this response.';
    const aiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-5.6', store: false, instructions,
        input: [{ role: 'user', content: [{ type: 'input_text', text: `User-provided title: ${title || '(none)'}. User-provided context: ${userContext || '(none)'}.` }, { type: 'input_image', image_url: payload.image, detail: 'high' }] }],
        text: { format: { type: 'json_schema', name: 'cultural_photo_description', strict: true, schema: descriptionSchema } }
      })
    });
    const aiResult = await aiResponse.json();
    if (!aiResponse.ok) return sendJson(response, aiResponse.status, { error: aiResult?.error?.message || 'The AI service could not analyze the image.' });
    if (!aiResult.output_text) return sendJson(response, 502, { error: 'The AI service did not return a description.' });
    return sendJson(response, 200, { analysis: JSON.parse(aiResult.output_text) });
  } catch (error) {
    console.error('Describe error:', error);
    return sendJson(response, 500, { error: error.message || 'An internal error occurred while describing the image.' });
  }
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  if (request.method === 'POST' && url.pathname === '/api/restore') return restore(request, response);
  if (request.method === 'POST' && url.pathname === '/api/describe') return describe(request, response);
  if (request.method !== 'GET' && request.method !== 'HEAD') return sendJson(response, 405, { error: 'Method not allowed' });
  const requested = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^[/\\]+/, '');
  const allowedFiles = new Set(['index.html', 'app.js', 'style.css', 'option-a.html', 'option-b.html', 'concepts.css', 'option-c.html', 'option-d.html', 'option-e.html', 'ui-options.css']);
  if (!allowedFiles.has(requested)) { response.writeHead(404); return response.end('Not found'); }
  const filePath = path.resolve(ROOT, requested);
  if (!fs.existsSync(filePath)) { response.writeHead(404); return response.end('Not found'); }
  response.writeHead(200, { 'Content-Type': MIME_TYPES[path.extname(filePath)] || 'application/octet-stream' });
  if (request.method === 'HEAD') return response.end();
  fs.createReadStream(filePath).pipe(response);
});

server.listen(PORT, () => console.log(`PicRes is running at http://localhost:${PORT}`));
