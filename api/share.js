const MAX_SHARE_BYTES = 12 * 1024 * 1024;
const shares = globalThis.picresShares || new Map();
globalThis.picresShares = shares;

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_SHARE_BYTES) throw new Error('Shared project is too large. Try a smaller image.');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function isImageDataUrl(value) {
  return /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value || '');
}

function createShareId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

module.exports = async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const payload = JSON.parse(await readBody(req));
      if (!isImageDataUrl(payload.beforeImage) || !isImageDataUrl(payload.afterImage)) {
        return sendJson(res, 400, { error: 'Shared project must include valid original and restored images.' });
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
      return sendJson(res, 200, { id, url: `/share/${id}` });
    } catch (error) {
      return sendJson(res, 400, { error: error.message || 'Unable to create share link.' });
    }
  }

  if (req.method === 'GET') {
    const queryId = req.query?.id;
    const id = Array.isArray(queryId) ? queryId[0] : queryId;
    const item = shares.get(id);
    if (!item) return sendJson(res, 404, { error: 'Shared project was not found.' });
    return sendJson(res, 200, { item });
  }

  return sendJson(res, 405, { error: 'Method not allowed' });
};
