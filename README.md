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
