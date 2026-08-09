# PicRes AI Restoration

Cultureach restores and colorizes photographs with the OpenAI Images Edits API, analyzes historical or cultural context with the Responses API, and lets users ask a Study Assistant about the uploaded image. The browser runs the interface; API routes run on the server so the API key remains private.

Restoration follows a fixed workflow: preserve the original subject and composition, repair visible damage, improve clarity, colorize the image naturally, and keep the final PNG faithful to the uploaded photo.

After restoration, Cultureach calls `POST /api/describe` to classify the original image and return observed details, a cautious identification, confidence level, and verification warnings. The Study Assistant uses `POST /api/study` to answer user questions from the uploaded image and user-provided context. It does not invent sources or assert an origin, date, location, or identity without evidence.

## Run locally

Node.js 22+ is required.

```powershell
$env:OPENAI_API_KEY = "your_api_key_here"
npm start
```

Open `http://localhost:3000`. JPG, PNG, and WEBP images are currently limited to 10 MB.

## Showcase projects

Prepared Showcase tab projects are controlled from source code only:

1. Add each before/after image to `public/showcase/`.
2. Edit the `showcaseProjects` array in `public/app.js`.
3. Use image paths like `showcase/my-project-before.jpg` and `showcase/my-project-after.jpg`.

Visitors can view the prepared projects, but there is no browser UI for adding, editing, or deleting Showcase items.

## API

- `POST /api/restore`: restores an image.
- `POST /api/describe`: analyzes the original image with vision and returns structured JSON for the interface.
- `POST /api/study`: answers Study Assistant questions about the uploaded image.

For a Vercel deployment, set `OPENAI_API_KEY` for `api/restore.js`, `api/describe.js`, and `api/study.js`.
