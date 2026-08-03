export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return response.status(503).json({ error: 'Missing OPENAI_API_KEY' });
  }

  try {
    const payload = await request.json();

    const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(payload.image || '');
    if (!match) {
      return response.status(400).json({ error: 'Invalid image payload' });
    }

    const bytes = Buffer.from(match[2], 'base64');
    if (bytes.length > 10 * 1024 * 1024) {
      return response.status(413).json({ error: 'Image exceeds 10 MB limit' });
    }

    const extension = match[1] === 'image/jpeg' ? 'jpg' : match[1].split('/')[1];
    const image = new Blob([bytes], { type: match[1] });
    const form = new FormData();
    form.append('model', 'gpt-image-2');
    form.append('image', image, `source.${extension}`);
    form.append('size', 'auto');
    form.append('quality', 'medium');
    form.append('output_format', 'png');
    form.append('prompt', payload.title ? `Image title: ${payload.title}` : 'Restore this image');

    const aiResponse = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: form
    });

    const aiResult = await aiResponse.json();

    if (!aiResponse.ok) {
      return response.status(aiResponse.status).json({
        error: aiResult?.error?.message || 'AI service failed'
      });
    }

    return response.status(200).json({
      imageBase64: aiResult?.data?.[0]?.b64_json,
      mimeType: 'image/png'
    });
  } catch (error) {
    return response.status(500).json({ error: error.message || 'Internal error' });
  }
}