const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

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

function parseJsonResponse(aiResult) {
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
    return sendJson(res, 413, { error: 'Image exceeds the 10 MB limit' });
  }

  const question = String(payload.question || '').trim().slice(0, 500);
  if (!question) return sendJson(res, 400, { error: 'Question is required' });

  const title = String(payload.title || '').slice(0, 120);
  const userContext = String(payload.context || '').slice(0, 600);
  const instructions = [
    'You are Cultureach Study Assistant for a cultural and historical image-learning app.',
    'Answer the user question using only visible evidence in the uploaded image and any user-provided title or context.',
    'Write in clear, natural English for a student. Keep the answer concise but useful, usually 80 to 160 words.',
    'Separate what is visible from what is only a possible interpretation. Use cautious wording for uncertain culture, date, origin, identity, event, or function.',
    'Do not claim a specific culture, period, landmark, person, source, or story as fact unless the image or user context supports it.',
    'For non-famous people, do not identify identity, private information, sensitive traits, ethnicity, religion, or nationality from appearance.',
    'When helpful, mention what details the user should inspect next and what would need human or source verification.',
    'Return only JSON that matches the schema. suggestedQuestions must be three short follow-up questions.'
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
            { type: 'input_text', text: `User-provided title: ${title || '(none)'}. User-provided context: ${userContext || '(none)'}. User question: ${question}` },
            { type: 'input_image', image_url: payload.image, detail: 'high' }
          ]
        }],
        text: { format: { type: 'json_schema', name: 'cultureach_study_answer', strict: true, schema: studySchema } }
      })
    });
    const aiResult = await aiResponse.json();
    if (!aiResponse.ok) return sendJson(res, aiResponse.status, { error: aiResult?.error?.message || 'AI service failed' });

    let studyAnswer;
    try {
      studyAnswer = parseJsonResponse(aiResult);
    } catch {
      return sendJson(res, 502, { error: 'AI returned a malformed study answer' });
    }

    if (!studyAnswer?.answer) return sendJson(res, 502, { error: 'AI did not return a study answer' });
    return sendJson(res, 200, {
      answer: studyAnswer.answer,
      suggestedQuestions: Array.isArray(studyAnswer.suggestedQuestions) ? studyAnswer.suggestedQuestions.slice(0, 3) : []
    });
  } catch (error) {
    return sendJson(res, 500, { error: error.message || 'Internal server error' });
  }
};
