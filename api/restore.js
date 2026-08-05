const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
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
  form.append('prompt', `${RESTORE_PROMPT} ${payload.title ? `Image title: ${String(payload.title).slice(0, 120)}.` : ''}`);

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
