const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 3000);
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MIME_TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };

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
        reject(new Error('Ảnh quá lớn. Giới hạn là 10 MB.'));
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
  if (!process.env.OPENAI_API_KEY) {
    return sendJson(response, 503, { error: 'Chưa cấu hình OPENAI_API_KEY trên máy chủ. Xem README.md để bật AI.' });
  }
  try {
    const payload = JSON.parse(await readBody(request));
    const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(payload.image || '');
    if (!match) return sendJson(response, 400, { error: 'Chỉ nhận ảnh JPG, PNG hoặc WEBP hợp lệ.' });
    const bytes = Buffer.from(match[2], 'base64');
    if (bytes.length > MAX_IMAGE_BYTES) return sendJson(response, 413, { error: 'Ảnh vượt quá 10 MB.' });
    const extension = match[1] === 'image/jpeg' ? 'jpg' : match[1].split('/')[1];
    const image = new Blob([bytes], { type: match[1] });
    const form = new FormData();
    form.append('model', 'gpt-image-2');
    form.append('image', image, `source.${extension}`);
    form.append('size', 'auto');
    form.append('quality', 'medium');
    form.append('output_format', 'png');
    form.append('prompt', `Restore this uploaded photograph with high fidelity. It may be an old, blurry, faded, damaged, black-and-white, historical, or traditional cultural image. Upscale it, improve sharpness and clarity, reduce noise and artifacts, and colorize naturally when the source is monochrome. Preserve the original subject identity, composition, facial features, period clothing, architecture, traditional artifacts, text, and cultural context. Do not invent people, objects, symbols, lettering, landmarks, or historical claims. Use conservative, plausible period-appropriate color when exact colors are unknowable. ${payload.title ? `Image title: ${String(payload.title).slice(0, 120)}.` : ''}`);
    const aiResponse = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST', headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: form
    });
    const aiResult = await aiResponse.json();
    if (!aiResponse.ok) {
      console.error('Image API error:', aiResult);
      return sendJson(response, aiResponse.status, { error: aiResult?.error?.message || 'Dịch vụ AI không thể xử lý ảnh.' });
    }
    const imageBase64 = aiResult?.data?.[0]?.b64_json;
    if (!imageBase64) return sendJson(response, 502, { error: 'Dịch vụ AI không trả về ảnh kết quả.' });
    sendJson(response, 200, { imageBase64, mimeType: 'image/png' });
  } catch (error) {
    console.error('Restore error:', error);
    sendJson(response, 500, { error: error.message || 'Có lỗi nội bộ khi phục hồi ảnh.' });
  }
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  if (request.method === 'POST' && url.pathname === '/api/restore') return restore(request, response);
  if (request.method !== 'GET' && request.method !== 'HEAD') return sendJson(response, 405, { error: 'Method not allowed' });
  const requested = url.pathname === '/' ? 'MainMenu.html' : decodeURIComponent(url.pathname).replace(/^[/\\]+/, '');
  const allowedFiles = new Set(['MainMenu.html', 'app.js', 'style.css']);
  if (!allowedFiles.has(requested)) { response.writeHead(404); return response.end('Not found'); }
  const filePath = path.resolve(ROOT, requested);
  if (!fs.existsSync(filePath)) { response.writeHead(404); return response.end('Not found'); }
  response.writeHead(200, { 'Content-Type': MIME_TYPES[path.extname(filePath)] || 'application/octet-stream' });
  if (request.method === 'HEAD') return response.end();
  fs.createReadStream(filePath).pipe(response);
});

server.listen(PORT, () => console.log(`PicRes is running at http://localhost:${PORT}`));
