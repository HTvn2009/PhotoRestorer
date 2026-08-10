const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, 'public');
const PORT = Number(process.env.PORT || 3000);
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_SHARE_BYTES = 12 * 1024 * 1024;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp'
};
const shares = new Map();
const RESTORE_PROMPT = [
  'Restore this uploaded image by following these steps in order:',
  '1. Analyze the original image and preserve its composition, subject identity, facial features, text, clothing, architecture, artifacts, and cultural or historical context.',
  '2. Repair visible damage such as scratches, dust, stains, fading, blur, compression artifacts, and torn or worn areas without inventing missing people, objects, symbols, lettering, landmarks, or historical details.',
  '3. Improve clarity with conservative sharpening, denoising, contrast correction, exposure balancing, and detail recovery.',
  '4. Colorize the image as a required step. If the source is black-and-white, sepia, or faded, produce a natural full-color version. If the source already has color, refresh and correct the colors so the final output still looks naturally colorized.',
  '5. Use plausible, period-appropriate, culturally respectful colors when exact colors are unknowable. Keep skin tones, clothing, materials, landscape, architecture, and artifacts realistic rather than stylized.',
  '6. Finalize as a clean restored PNG that looks like the same photograph, not a newly invented scene.',
  'The final image must include natural colorization and must not remain black-and-white or sepia unless the uploaded subject itself visibly requires monochrome markings.'
].join(' ');
const descriptionSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    category: { type: 'string', enum: ['historical', 'cultural', 'artifact', 'landmark', 'people', 'general'] },
    observedDetails: { type: 'array', items: { type: 'string' } },
    identification: { type: 'object', additionalProperties: false, properties: { candidate: { type: 'string' }, confidence: { type: 'string', enum: ['low', 'medium', 'high'] }, reason: { type: 'string' } }, required: ['candidate', 'confidence', 'reason'] },
    description: { type: 'string' },
    origin: { type: 'string' },
    buildPeriod: { type: 'string' },
    purpose: { type: 'string' },
    significance: { type: 'string' },
    historicalContext: { type: 'string' },
    warnings: { type: 'array', items: { type: 'string' } },
    humanCheck: { type: 'boolean' },
    sourceSearchRecommended: { type: 'boolean' }
  },
  required: ['category', 'observedDetails', 'identification', 'description', 'origin', 'buildPeriod', 'purpose', 'significance', 'historicalContext', 'warnings', 'humanCheck', 'sourceSearchRecommended']
};
const studySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    answer: { type: 'string' },
    suggestedQuestions: {
      type: 'array',
      items: { type: 'string' }
    }
  },
  required: ['answer', 'suggestedQuestions']
};

const DESCRIBE_INSTRUCTIONS = [
  'You analyze photographs for a cultural and historical photo-restoration product.',
  'Respond in English using the supplied JSON schema.',
  'Write for a normal viewer: natural, clear, and easy to observe. Avoid stiff labels inside prose, technical restoration language, or long inventories.',
  'First classify the image, then describe only visual evidence visible in the original image plus any user-provided context.',
  'The description field is the main text that will be placed inside a description box. Keep it self-contained, polished, and readable as one natural paragraph of 70 to 120 words.',
  'Do not put Markdown, HTML, bullet symbols, numbering, table syntax, code fences, or section headings inside the description field.',
  'For well-known landmarks, artifacts, or cultural subjects, make the description a concise encyclopedia-style narrative: what the subject appears to be, why it matters, its visible character, and cautious historical significance.',
  'Keep observedDetails short and selective: 3 to 5 simple visible cues that directly support the description. Each cue must be easy for a viewer to check in the image.',
  'Populate origin, buildPeriod, purpose, significance, and historicalContext with concise, evidence-based prose only when the image or user context supports it. Use an empty string when unsupported.',
  'Do not identify a person, origin, date, location, event, artifact, landmark, or cultural tradition as fact unless it is directly supported by visible evidence or user-provided context.',
  'For uncertain identification, use cautious wording, set low or medium confidence, add a warning, and set humanCheck to true.',
  'For non-famous people, never infer identity, private information, or sensitive traits.',
  'Do not invent sources, citations, stories, text, symbols, or historical claims. sourceSearchRecommended may be true for a plausible historical, cultural, artifact, or landmark candidate, but no source is verified in this response.'
].join(' ');

const STUDY_INSTRUCTIONS = [
  'You are Cultureach Study Assistant for a cultural and historical image-learning app.',
  'Answer the user question using only visible evidence in the uploaded image and any user-provided title or context.',
  'Write in clear, natural English for a student. Keep the answer concise but useful, usually 80 to 160 words.',
  'Separate what is visible from what is only a possible interpretation. Use cautious wording for uncertain culture, date, origin, identity, event, or function.',
  'Do not claim a specific culture, period, landmark, person, source, or story as fact unless the image or user context supports it.',
  'For non-famous people, do not identify identity, private information, sensitive traits, ethnicity, religion, or nationality from appearance.',
  'When helpful, mention what details the user should inspect next and what would need human or source verification.',
  'Return only JSON that matches the schema. suggestedQuestions must be three short follow-up questions.'
].join(' ');

function parseDescribeResponse(aiResult) {
  if (aiResult?.output_parsed && typeof aiResult.output_parsed === 'object') {
    return aiResult.output_parsed;
  }

  if (typeof aiResult?.output_text === 'string') {
    return JSON.parse(aiResult.output_text);
  }

  const output = Array.isArray(aiResult?.output) ? aiResult.output : [];
  for (const item of output) {
    const textBlocks = Array.isArray(item?.content) ? item.content : [];
    for (const block of textBlocks) {
      const text = typeof block?.text === 'string' ? block.text : typeof block?.output_text === 'string' ? block.output_text : '';
      if (!text) continue;
      return JSON.parse(text);
    }
  }

  return null;
}

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
        reject(new Error('Image is too large. The limit is 10 MB.'));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    request.on('error', reject);
  });
}

function parseJsonResponse(aiResult) {
  return parseDescribeResponse(aiResult);
}

function readShareBody(request) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    request.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_SHARE_BYTES) {
        reject(new Error('Shared project is too large. Try a smaller image.'));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    request.on('error', reject);
  });
}

function isImageDataUrl(value) {
  return /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value || '');
}

function createShareId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

async function shareProject(request, response, url) {
  if (request.method === 'POST') {
    try {
      const payload = JSON.parse(await readShareBody(request));
      if (!isImageDataUrl(payload.beforeImage) || !isImageDataUrl(payload.afterImage)) {
        return sendJson(response, 400, { error: 'Shared project must include valid original and restored images.' });
      }

      const id = createShareId();
      const item = {
        id,
        name: String(payload.name || 'Restored image').slice(0, 120),
        description: String(payload.description || '').slice(0, 5000),
        beforeImage: payload.beforeImage,
        afterImage: payload.afterImage,
        savedAt: payload.savedAt || new Date().toISOString(),
        sharedAt: new Date().toISOString()
      };
      shares.set(id, item);
      return sendJson(response, 200, { id, url: `/share/${id}` });
    } catch (error) {
      return sendJson(response, 400, { error: error.message || 'Unable to create share link.' });
    }
  }

  if (request.method === 'GET') {
    const id = url.searchParams.get('id') || url.pathname.split('/').pop();
    const item = shares.get(id);
    if (!item) return sendJson(response, 404, { error: 'Shared project was not found.' });
    return sendJson(response, 200, { item });
  }

  return sendJson(response, 405, { error: 'Method not allowed' });
}

async function restore(request, response) {
  if (!process.env.OPENAI_API_KEY) return sendJson(response, 503, { error: 'OPENAI_API_KEY is not configured on the server. See README.md to enable AI.' });
  try {
    const payload = JSON.parse(await readBody(request));
    const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(payload.image || '');
    if (!match) return sendJson(response, 400, { error: 'Only valid JPG, PNG, or WEBP images are accepted.' });
    const bytes = Buffer.from(match[2], 'base64');
    if (bytes.length > MAX_IMAGE_BYTES) return sendJson(response, 413, { error: 'Image exceeds the 10 MB limit.' });
    const extension = match[1] === 'image/jpeg' ? 'jpg' : match[1].split('/')[1];
    const image = new Blob([bytes], { type: match[1] });
    const form = new FormData();
    form.append('model', 'gpt-image-2');
    form.append('image', image, `source.${extension}`);
    form.append('size', 'auto');
    form.append('quality', 'medium');
    form.append('output_format', 'png');
    form.append('prompt', `${RESTORE_PROMPT} ${payload.title ? `Image title: ${String(payload.title).slice(0, 120)}.` : ''}`);
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
    if (Buffer.from(match[2], 'base64').length > MAX_IMAGE_BYTES) return sendJson(response, 413, { error: 'Image exceeds the 10 MB limit.' });
    const title = String(payload.title || '').slice(0, 120);
    const userContext = String(payload.context || '').slice(0, 600);
    const aiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-5.6', store: false, instructions: DESCRIBE_INSTRUCTIONS,
        input: [{ role: 'user', content: [{ type: 'input_text', text: `User-provided title: ${title || '(none)'}. User-provided context: ${userContext || '(none)'}.` }, { type: 'input_image', image_url: payload.image, detail: 'high' }] }],
        text: { format: { type: 'json_schema', name: 'cultural_photo_description', strict: true, schema: descriptionSchema } }
      })
    });
    const aiResult = await aiResponse.json();
    if (!aiResponse.ok) return sendJson(response, aiResponse.status, { error: aiResult?.error?.message || 'The AI service could not analyze the image.' });

    let analysis;
    try {
      analysis = parseDescribeResponse(aiResult);
    } catch (error) {
      return sendJson(response, 502, { error: 'The AI service returned a malformed description payload.' });
    }

    if (!analysis) return sendJson(response, 502, { error: 'The AI service did not return a description.' });
    return sendJson(response, 200, { analysis });
  } catch (error) {
    console.error('Describe error:', error);
    return sendJson(response, 500, { error: error.message || 'An internal error occurred while describing the image.' });
  }
}

async function study(request, response) {
  if (!process.env.OPENAI_API_KEY) return sendJson(response, 503, { error: 'OPENAI_API_KEY is not configured on the server.' });
  try {
    const payload = JSON.parse(await readBody(request));
    const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(payload.image || '');
    if (!match) return sendJson(response, 400, { error: 'Only valid JPG, PNG, or WEBP images are accepted.' });
    if (Buffer.from(match[2], 'base64').length > MAX_IMAGE_BYTES) return sendJson(response, 413, { error: 'Image exceeds the 10 MB limit.' });

    const question = String(payload.question || '').trim().slice(0, 500);
    if (!question) return sendJson(response, 400, { error: 'Question is required.' });

    const title = String(payload.title || '').slice(0, 120);
    const userContext = String(payload.context || '').slice(0, 600);
    const aiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-5.6',
        store: false,
        instructions: STUDY_INSTRUCTIONS,
        input: [{
          role: 'user',
          content: [
            { type: 'input_text', text: `User-provided title: ${title || '(none)'}. User-provided context: ${userContext || '(none)'}. User question: ${question}` },
            { type: 'input_image', image_url: payload.image, detail: 'high' }
          ]
        }],
        text: { format: { type: 'json_schema', name: 'cultureach_study_answer', strict: true, schema: studySchema } }
      })
    });
    const aiResult = await aiResponse.json();
    if (!aiResponse.ok) return sendJson(response, aiResponse.status, { error: aiResult?.error?.message || 'The AI service could not answer the question.' });

    let studyAnswer;
    try {
      studyAnswer = parseJsonResponse(aiResult);
    } catch (error) {
      return sendJson(response, 502, { error: 'The AI service returned a malformed study answer.' });
    }

    if (!studyAnswer?.answer) return sendJson(response, 502, { error: 'The AI service did not return a study answer.' });
    return sendJson(response, 200, {
      answer: studyAnswer.answer,
      suggestedQuestions: Array.isArray(studyAnswer.suggestedQuestions) ? studyAnswer.suggestedQuestions.slice(0, 3) : []
    });
  } catch (error) {
    console.error('Study error:', error);
    return sendJson(response, 500, { error: error.message || 'An internal error occurred while answering the question.' });
  }
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  if (request.method === 'POST' && url.pathname === '/api/restore') return restore(request, response);
  if (request.method === 'POST' && url.pathname === '/api/describe') return describe(request, response);
  if (request.method === 'POST' && url.pathname === '/api/study') return study(request, response);
  if (url.pathname === '/api/share' || url.pathname.startsWith('/api/share/')) return shareProject(request, response, url);
  if (request.method !== 'GET' && request.method !== 'HEAD') return sendJson(response, 405, { error: 'Method not allowed' });
  const requested = url.pathname === '/' || url.pathname.startsWith('/share/') ? 'index.html' : decodeURIComponent(url.pathname).replace(/^[/\\]+/, '');
  const allowedFiles = new Set(['index.html', 'app.js', 'style.css', 'e.html', 'education-layouts.css', 'option-a.html', 'option-b.html', 'concepts.css', 'option-c.html', 'option-d.html', 'option-e.html', 'ui-options.css']);
  const isShowcaseImage = requested.startsWith('showcase/')
    && ['.jpg', '.jpeg', '.png', '.webp'].includes(path.extname(requested).toLowerCase());
  if (!allowedFiles.has(requested) && !isShowcaseImage) { response.writeHead(404); return response.end('Not found'); }
  const filePath = path.resolve(ROOT, requested);
  if (!filePath.startsWith(`${ROOT}${path.sep}`)) { response.writeHead(404); return response.end('Not found'); }
  if (!fs.existsSync(filePath)) { response.writeHead(404); return response.end('Not found'); }
  response.writeHead(200, { 'Content-Type': MIME_TYPES[path.extname(filePath)] || 'application/octet-stream' });
  if (request.method === 'HEAD') return response.end();
  fs.createReadStream(filePath).pipe(response);
});

server.listen(PORT, () => console.log(`PicRes is running at http://localhost:${PORT}`));
