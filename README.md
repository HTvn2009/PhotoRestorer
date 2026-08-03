# PicRes AI Restoration

## Chạy ứng dụng

1. Tạo biến môi trường `OPENAI_API_KEY` (không đưa khóa vào mã nguồn hoặc trình duyệt).
2. Chạy `node server.js`.
3. Mở `http://localhost:3000`.

Trên PowerShell cho phiên làm việc hiện tại:

```powershell
$env:OPENAI_API_KEY = "your_api_key_here"
node server.js
```

Ứng dụng dùng endpoint Image Edits với `gpt-image-2`. Ảnh được gửi từ trình duyệt đến backend cục bộ; backend mới gọi API, nên khóa không bị lộ ở frontend. Ảnh gốc và ảnh kết quả không được ghi vào thư mục dự án.

<<<<<<< Updated upstream
TBD
=======
## Deploy lên Vercel

1. Đẩy toàn bộ repository lên GitHub/GitLab/Bitbucket và import repository vào Vercel. Chọn thư mục gốc dự án làm **Root Directory**.
2. Trong **Settings → Build and Deployment**, chọn Framework Preset là **Other**, để trống Build Command và Output Directory. Không đặt `app.js` làm Entry Point, Build Command hoặc Serverless Function.
3. Trong **Settings → Environment Variables**, thêm `OPENAI_API_KEY` cho môi trường Production (và Preview nếu cần), sau đó redeploy.

Giao diện nằm trong thư mục `public/`, với `public/index.html` là trang chủ. Vercel tự nhận diện duy nhất `api/restore.js` là Function tại `POST /api/restore`; `public/app.js` chỉ được phục vụ cho trình duyệt và không chạy trong Node.js.

Vercel giới hạn request body của Function ở 4.5 MB. Vì ảnh được gửi dưới dạng base64, ứng dụng giới hạn ảnh nguồn ở 3 MB để request không vượt giới hạn này.
>>>>>>> Stashed changes
