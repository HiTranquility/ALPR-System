# License Plate Recognition (ALPR) System

This document describes the license plate recognition process implemented in the ALPR system.

## Overview

The ALPR (Automatic License Plate Recognition) system uses a combination of computer vision and OCR techniques to detect and read license plates from images. The system is built using Python and leverages several key technologies:

- YOLO (You Only Look Once) for license plate detection
- EasyOCR for text recognition
- OpenCV for image processing

## Recognition Process

The license plate recognition process follows these steps:

1. **Image Input**
   - The system accepts image input in bytes format
   - Converts the input to OpenCV format for processing

2. **Initial OCR**
   - Performs OCR on the full original image
   - This serves as a baseline for text recognition

3. **License Plate Detection**
   - Uses YOLO model to detect license plate location in the image
   - Returns bounding box coordinates and cropped plate image

4. **Image Validation**
   - Validates the cropped image based on:
     - Minimum width and height requirements
     - Aspect ratio constraints
     - Brightness levels
   - Ensures the image is suitable for OCR processing

5. **Image Enhancement** (if needed)
   - If the cropped image doesn't meet validation criteria, applies enhancement:
     1. Resizes small images while maintaining aspect ratio
     2. Converts to grayscale
     3. Applies bilateral filtering to reduce noise while preserving edges
     4. Enhances contrast using CLAHE (Contrast Limited Adaptive Histogram Equalization)
     5. Sharpens the image using a custom kernel

6. **Text Recognition**
   - Performs OCR on the processed image
   - Cleans and standardizes the recognized text:
     - Converts to uppercase
     - Removes special characters
     - Keeps only alphanumeric characters, hyphens, and dots

7. **Result Selection**
   - Compares results from different processing stages
   - Selects the best result based on text length and quality
   - Returns the processed image and recognized plate number

## Error Handling

The system includes robust error handling:
- Falls back to original image processing if plate detection fails
- Validates image quality at multiple stages
- Provides clear error messages for debugging

## Performance Considerations

- Processing time is measured and included in the results
- Image enhancement is only applied when necessary
- Multiple OCR attempts are made to ensure accuracy

## Dependencies

- OpenCV (cv2)
- NumPy
- EasyOCR
- Ultralytics YOLO
- PIL (Python Imaging Library)

## Usage

The main entry point is the `run_alpr()` function, which takes image bytes as input and returns:
- Processed image bytes
- Recognized plate number
- Processing time

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

