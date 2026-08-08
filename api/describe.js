const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

const descriptionSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    category: { type: 'string', enum: ['historical', 'cultural', 'artifact', 'landmark', 'people', 'general'] },
    observedDetails: { type: 'array', items: { type: 'string' } },
    identification: {
      type: 'object',
      additionalProperties: false,
      properties: {
        candidate: { type: 'string' },
        confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
        reason: { type: 'string' }
      },
      required: ['candidate', 'confidence', 'reason']
    },
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

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
  if (!process.env.OPENAI_API_KEY) return sendJson(res, 503, { error: 'Missing OPENAI_API_KEY' });

  let payload;
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return sendJson(res, 400, { error: 'Invalid JSON body' });
  }

  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(payload.image || '');
  if (!match) return sendJson(res, 400, { error: 'Invalid image payload' });
  if (Buffer.from(match[2], 'base64').length > MAX_IMAGE_BYTES) {
    return sendJson(res, 413, { error: 'Image exceeds the 3 MB limit' });
  }

  const title = String(payload.title || '').slice(0, 120);
  const userContext = String(payload.context || '').slice(0, 600);
  const instructions = [
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

  try {
    const aiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-5.6',
        store: false,
        instructions,
        input: [{
          role: 'user',
          content: [
            { type: 'input_text', text: `User-provided title: ${title || '(none)'}. User-provided context: ${userContext || '(none)'}.` },
            { type: 'input_image', image_url: payload.image, detail: 'high' }
          ]
        }],
        text: { format: { type: 'json_schema', name: 'cultural_photo_description', strict: true, schema: descriptionSchema } }
      })
    });
    const aiResult = await aiResponse.json();
    if (!aiResponse.ok) return sendJson(res, aiResponse.status, { error: aiResult?.error?.message || 'AI service failed' });

    let analysis;
    try {
      analysis = parseDescribeResponse(aiResult);
    } catch (error) {
      return sendJson(res, 502, { error: 'AI returned a malformed description payload' });
    }

    if (!analysis) return sendJson(res, 502, { error: 'AI did not return a description' });
    return sendJson(res, 200, { analysis });
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'Internal server error' });
  }
};
