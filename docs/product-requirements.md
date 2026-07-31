# Product Requirements Document — Phục dựng ảnh văn hóa và lịch sử

## 1. Mục tiêu sản phẩm

Xây dựng website cho phép người dùng tải lên ảnh cổ vật, ảnh lịch sử hoặc ảnh văn hóa để cải thiện chất lượng hình ảnh và màu sắc. Sau khi xử lý, hệ thống cung cấp thông tin có căn cứ về bức ảnh: nhận diện đối tượng, nguồn gốc, bối cảnh và các tư liệu liên quan khi có thể xác minh.

Ưu tiên sản phẩm là nội dung văn hóa, cổ vật và lịch sử. Ảnh thông thường vẫn được hỗ trợ ở mức tăng sáng, chỉnh màu, giảm nhiễu và mô tả ngắn.

## 2. Người dùng và giá trị

- Người yêu lịch sử, văn hóa hoặc sưu tầm cổ vật cần cải thiện ảnh và tìm hiểu ngữ cảnh.
- Người dùng phổ thông muốn khôi phục ảnh cũ.
- Người dùng có thể xem mẫu, tự điều chỉnh kết quả, lưu ảnh vào **My Gallery** và chia sẻ.

## 3. Phạm vi tính năng

### Upload và phục dựng

Người dùng tải ảnh, thêm tiêu đề hoặc mô tả tùy chọn, rồi chọn phục dựng. Hệ thống phân loại sơ bộ ảnh thành: ảnh văn hóa/lịch sử, cổ vật, ảnh có người, địa danh hoặc nội dung thông thường.

| Loại và chất lượng ảnh | Xử lý chính |
| --- | --- |
| Ảnh cũ | Restore, khử nhiễu, cải thiện chi tiết, mô tả |
| Ảnh nét | Minor upscale và light enhancement |
| Ảnh mờ | Large upscale và light enhancement |
| Cổ vật cũ/mờ | Ưu tiên restore và upscale trước khi nhận diện |
| Nội dung thông thường | Chỉnh màu, độ sáng, ánh sáng; mô tả ngắn |

Không được thêm người, vật thể, chữ viết, biểu tượng, địa danh hoặc chi tiết lịch sử không có trong ảnh. Mọi màu sắc suy đoán phải được diễn đạt là ước lượng.

### Thông tin sau xử lý

Với ảnh văn hóa, lịch sử, cổ vật hoặc địa danh, hiển thị:

- **Nhận diện:** đối tượng, vị trí (nếu xác định được), mức độ tin cậy.
- **Description:** tên, xuất xứ, công dụng và bối cảnh.
- **Tư liệu liên quan:** nguồn tham khảo, câu chuyện liên quan và liên kết duyệt web khi có nguồn đáng tin cậy.
- **Human check:** đánh dấu nội dung chưa chắc chắn, cần người dùng hoặc chuyên gia xác nhận.

Nếu ảnh đủ phổ biến và có dữ liệu tin cậy, hiển thị phần chi tiết mở rộng. Nếu không, ưu tiên hỗ trợ phục dựng và đề xuất nguồn liên quan thay vì khẳng định thông tin không kiểm chứng.

### Nội dung có người

- **Người không nổi tiếng:** chỉ mô tả có thể quan sát được, ví dụ trang phục, bối cảnh, ước lượng độ tuổi hoặc giới tính khi thật sự cần thiết và ở mức dè dặt. Không suy đoán danh tính, đời tư hay đặc điểm nhạy cảm.
- **Người nổi tiếng:** chỉ thêm tiểu sử nền và thành tựu từ nguồn đáng tin cậy. Không suy luận hoặc tập trung vào chính trị, tôn giáo, giới tính hay các chủ đề nhạy cảm.

## 4. Trải nghiệm người dùng

Luồng chính: **Upload → xem trước → chọn/tinh chỉnh phục dựng → nhận ảnh kết quả → xem mô tả và nguồn → lưu hoặc chia sẻ**.

Website cần có các khu vực: **Shortcut** (ảnh mẫu và công cụ chỉnh sửa), **My Gallery**, **Help** (hướng dẫn, lưu ý nội dung, loại ảnh phù hợp) và trạng thái xử lý rõ ràng. Người dùng có thể tùy chỉnh prompt, mức độ sắc nét và nội dung câu chuyện; thay đổi này phải được ghi nhận là lựa chọn của người dùng.

## 5. Yêu cầu phi chức năng và an toàn

- Không lưu ảnh gốc hoặc ảnh kết quả nếu người dùng chưa chủ động lưu vào Gallery.
- Không đưa khóa API ra frontend; mọi yêu cầu AI chạy qua backend.
- Hiển thị giới hạn dung lượng, định dạng được hỗ trợ và lỗi xử lý dễ hiểu.
- Không dùng mô tả để khẳng định nguồn gốc, danh tính hoặc sự kiện lịch sử khi chưa có bằng chứng.
- Nêu rõ nguồn, thời điểm truy xuất và mức độ tin cậy cho thông tin từ web.

## 6. Tiêu chí chấp nhận cho MVP

1. Người dùng tải được JPG, PNG hoặc WEBP và nhận ảnh đã phục dựng.
2. Người dùng xem được mô tả phù hợp với loại nội dung, kèm cảnh báo khi thông tin chưa xác minh.
3. Ảnh văn hóa/cổ vật được ưu tiên luồng nhận diện và tìm tư liệu liên quan.
4. Người dùng có thể tải ảnh kết quả xuống; Gallery, chia sẻ và truy xuất web có thể triển khai theo giai đoạn tiếp theo.
5. Nội dung có người và nội dung nhạy cảm tuân thủ các giới hạn mô tả nêu trên.
