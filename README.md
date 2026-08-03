# PicRes AI Restoration

Ứng dụng phục dựng ảnh bằng OpenAI Images Edits API. Mã giao diện chạy trong trình duyệt; chỉ `api/restore.js` chạy trên máy chủ để giữ kín khóa API.

## Chạy cục bộ

Yêu cầu Node.js 22+.

```powershell
$env:OPENAI_API_KEY = "your_api_key_here"
npm start
```

Mở `http://localhost:3000`.

## Deploy lên Vercel

1. Đẩy toàn bộ repository lên GitHub/GitLab/Bitbucket và import repository vào Vercel. Chọn thư mục gốc dự án làm **Root Directory**.
2. Trong **Settings → Build and Deployment**, chọn Framework Preset là **Other**, để trống Build Command và Output Directory. Không đặt `app.js` làm Entry Point, Build Command hoặc Serverless Function.
3. Trong **Settings → Environment Variables**, thêm `OPENAI_API_KEY` cho môi trường Production (và Preview nếu cần), sau đó redeploy.

`vercel.json` đưa `/` tới giao diện `MainMenu.html`; Vercel tự nhận diện duy nhất `api/restore.js` là Function tại `POST /api/restore`.

Vercel giới hạn request body của Function ở 4.5 MB. Vì ảnh được gửi dưới dạng base64, ứng dụng giới hạn ảnh nguồn ở 3 MB để request không vượt giới hạn này.
