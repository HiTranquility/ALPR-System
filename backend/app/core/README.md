# 🚗 Automatic License Plate Recognition (ALPR)

## 📌 Mục tiêu

Hệ thống này thực hiện nhận diện biển số xe từ ảnh đầu vào (JPEG/PNG), sử dụng **YOLOv8** để định vị biển số và **EasyOCR** để trích xuất ký tự.  
Logic được tối ưu để xử lý nhanh, chính xác, và chọn kết quả tốt nhất giữa các phương án (ảnh gốc, crop, và crop đã xử lý).

---

## 🔧 Thư viện chính

- `OpenCV` – xử lý ảnh
- `EasyOCR` – đọc ký tự
- `Ultralytics YOLOv8` – phát hiện vùng biển số
- `NumPy`, `re` – xử lý mảng và chuỗi

---

## 🧠 Quy trình xử lý `run_alpr(ori_bytes)`

```text
                +--------------------+
Input bytes →   |  Convert to OpenCV |
                +---------+----------+
                          |
                          v
                +-------------------------+
                | OCR ảnh gốc (EasyOCR)   |
                | → Làm sạch chuỗi        |
                +-------------------------+
                          |
                          v
                +------------------------------+
                | Detect biển số (YOLOv8)      |
                | → Nếu fail → bỏ qua          |
                +---------------+--------------+
                                |
                      +---------+----------+
                      |                    |
                      v                    v
        +------------------------+   +----------------------------+
        | Crop ảnh từ YOLO box   |   | Nếu crop mờ → xử lý nâng cao |
        | → OCR crop             |   | → Resize, CLAHE, Sharpen     |
        | → So sánh độ dài       |   | → OCR lại                    |
        +------------------------+   +----------------------------+

        🔁 So sánh kết quả:
        - Nếu crop/enhanced dài hơn ảnh gốc → dùng
        - Nếu không → giữ ảnh gốc

                          |
                          v
                +-----------------------------+
                | Encode ảnh (JPEG bytes)     |
                | Trả về dict gồm:            |
                | - crop_bytes                |
                | - plate_number              |
                | - process_time (seconds)    |
                +-----------------------------+

```

## ✅ Các hàm chính

Hàm	Chức năng
run_alpr(ori_bytes)	Hàm chính nhận ảnh bytes → trả kết quả nhận dạng
get_plate_text_from_image(img)	OCR và làm sạch chuỗi
detect_plate_yolo(img_cv)	Dùng YOLO để lấy vùng biển số
enhanced_ocr(crop)	Làm nét, tăng tương phản → OCR nâng cao
sanitize_plate_text(text)	Làm sạch ký tự: bỏ dấu, giữ A–Z, 0–9, -, .
is_valid_crop(...)	Kiểm tra ảnh crop có đủ sáng và rõ để OCR trực tiếp hay không

