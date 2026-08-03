# PicRes AI Restoration

Ứng dụng phục dựng ảnh bằng OpenAI Images Edits API. Mã giao diện chạy trong trình duyệt; chỉ `api/restore.js` chạy trên máy chủ để giữ kín khóa API.

## Chạy cục bộ

Yêu cầu Node.js 22+.

```powershell
$env:OPENAI_API_KEY = "your_api_key_here"
npm start