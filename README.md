# PicRes AI Restoration

PicRes restores photographs with the OpenAI Images Edits API and analyzes historical or cultural context with the Responses API. The browser runs the interface; API routes run on the server so the API key remains private.

After restoration, PicRes calls `POST /api/describe` to classify the original image and return observed details, a cautious identification, confidence level, and verification warnings. It does not invent sources or assert an origin, date, location, or identity without evidence.

## Run locally

Node.js 22+ is required.

```powershell
$env:OPENAI_API_KEY = "your_api_key_here"
npm start
```

Open `http://localhost:3000`. JPG, PNG, and WEBP images are currently limited to 3 MB.

## API

- `POST /api/restore`: restores an image.
- `POST /api/describe`: analyzes the original image with vision and returns structured JSON for the interface.

For a Vercel deployment, set `OPENAI_API_KEY` for both `api/restore.js` and `api/describe.js`.
