const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  if (!process.env.OPENAI_API_KEY) {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Missing OPENAI_API_KEY' }));
  }

  let payload = {};

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch (error) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Invalid JSON body' }));
  }

  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(payload.image || '');
  if (!match) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Invalid image payload' }));
  }

  const bytes = Buffer.from(match[2], 'base64');
  if (bytes.length > MAX_IMAGE_BYTES) {
    res.statusCode = 413;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Image exceeds the 3 MB Vercel limit' }));
  }

  const extension = match[1] === 'image/jpeg' ? 'jpg' : match[1].split('/')[1];
  const image = new Blob([bytes], { type: match[1] });
  const form = new FormData();

  form.append('model', 'gpt-image-2');
  form.append('image', image, `source.${extension}`);
  form.append('size', 'auto');
  form.append('quality', 'medium');
  form.append('output_format', 'png');
  form.append('prompt', payload.title ? `Image title: ${String(payload.title).slice(0, 120)}` : 'Restore this image');

  try {
    const aiResponse = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: form
    });

    const aiResult = await aiResponse.json();

    if (!aiResponse.ok) {
      res.statusCode = aiResponse.status;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: aiResult?.error?.message || 'AI service failed' }));
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      imageBase64: aiResult?.data?.[0]?.b64_json,
      mimeType: 'image/png'
    }));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: error.message || 'Internal server error' }));
  }
};