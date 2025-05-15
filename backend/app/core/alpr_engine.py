# core/alpr_engine.py
import cv2
import numpy as np
import time
from io import BytesIO
from PIL import Image
from ultralytics import YOLO
import os
import easyocr
import re

reader = easyocr.Reader(['en', 'vi'])

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # core/
MODEL_PATH = os.path.join(BASE_DIR, "best.pt")

model = YOLO(MODEL_PATH)

def sanitize_plate_text(text):
    """
    Làm sạch chuỗi OCR từ biển số:
    - Loại bỏ ký tự lạ, giữ lại A-Z, 0-9, dấu gạch và dấu chấm
    - Chuyển về in hoa toàn bộ
    """
    text = text.upper()
    text = re.sub(r'[^A-Z0-9\-.]', '', text)  # Chỉ giữ A–Z, 0–9, -, .
    return text

def get_plate_text_from_image(img):
    """
    Thực hiện OCR và trả về chuỗi biển số đã làm sạch
    """
    results = reader.readtext(img)
    text_raw = ''.join(res[1] for res in results)
    return sanitize_plate_text(text_raw)


def detect_plate_yolo(img_cv):
    """
    Returns: (crop_img, bounding_box)
    - crop_img: cropped license plate image
    - bounding_box: tuple (x1, y1, x2, y2)
    """
    img_rgb = cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB)
    results = model(img_rgb)

    boxes = results[0].boxes.xyxy.cpu().numpy()
    if len(boxes) == 0:
        raise ValueError("No license plate detected")

    x1, y1, x2, y2 = boxes[0].astype(int)
    crop = img_cv[y1:y2, x1:x2]
    return crop, (x1, y1, x2, y2)

def is_valid_full_image(img_cv, min_w=160, min_h=60, min_brightness=60):
    """
    Run early OCR on original image. If valid → return text.
    Returns: (bool is_valid, str plate_text)
    """
    if not isinstance(img_cv, np.ndarray):
        return False, ""

    h, w = img_cv.shape[:2]
    if w < min_w or h < min_h:
        return False, ""

    aspect_ratio = w / h
    if not (1.5 <= aspect_ratio <= 6.5):
        return False, ""

    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    brightness = np.mean(gray)
    if brightness < min_brightness:
        return False, ""

    # Try OCR
    results = reader.readtext(img_cv)
    text_try = ''.join(res[1] for res in results)
    plate_text = sanitize_plate_text(text_try)

    return True, plate_text


def enhanced_ocr(plate_crop):
   
    # 1. Resize nếu ảnh quá nhỏ
    h, w = plate_crop.shape[:2]
    if w < 100 or h < 80:
        # Gợi ý: Cân nhắc việc upscale lên một kích thước mục tiêu cụ thể hơn
        # hoặc dùng interpolation khác nếu muốn thử nghiệm.
        # Ví dụ: upscale để chiều rộng tối thiểu là 150px, chiều cao 100px
        target_w, target_h = 150, 100
        scale_w = target_w / w if w > 0 else 2.0
        scale_h = target_h / h if h > 0 else 2.0
        scale_factor = max(scale_w, scale_h, 2.0) # Đảm bảo ít nhất là scale 2.0 nếu đã nhỏ

        # cv2.INTER_LANCZOS4 có thể cho kết quả sắc nét hơn INTER_CUBIC khi upscale, đáng để thử.
        plate_crop = cv2.resize(plate_crop, None, fx=scale_factor, fy=scale_factor, interpolation=cv2.INTER_LANCZOS4)
        # plate_crop = cv2.resize(plate_crop, None, fx=scale_factor, fy=scale_factor, interpolation=cv2.INTER_CUBIC) # Code gốc

    # 2. Grayscale
    gray = cv2.cvtColor(plate_crop, cv2.COLOR_BGR2GRAY)

    # 3. Bilateral Filter (giảm nhiễu nhưng giữ cạnh)
    # Gợi ý: Tinh chỉnh tham số để giảm nhiễu mà không làm mờ quá nhiều chi tiết cạnh,
    # đặc biệt là các chi tiết nhỏ như dấu chấm.
    # d: Đường kính vùng lân cận. Giá trị nhỏ hơn (5 hoặc 7) có thể giữ lại nhiều chi tiết hơn.
    # sigmaColor, sigmaSpace: Giá trị nhỏ hơn (ví dụ 50-60) sẽ ít làm mờ hơn.
    # filtered = cv2.bilateralFilter(gray, 9, 75, 75) # Code gốc
    filtered = cv2.bilateralFilter(gray, d=7, sigmaColor=60, sigmaSpace=60) # Gợi ý thử nghiệm

    # 4. CLAHE (tăng tương phản)
    # Gợi ý: Nếu ảnh bị nhiễu hạt nhiều sau bước sharpening, có thể giảm clipLimit.
    # clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)) # Code gốc
    clahe = cv2.createCLAHE(clipLimit=1.8, tileGridSize=(8, 8)) # Gợi ý thử nghiệm (giảm nhẹ)

    contrast = clahe.apply(filtered)

    # 5. Sharpen (cải thiện biên nét)
    # Gợi ý: Kernel hiện tại khá mạnh, có thể gây ra hiệu ứng "halo" (viền sáng/tối) quanh ký tự.
    # Thử một kernel làm sắc nét nhẹ nhàng hơn.
    # kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]]) # Code gốc

    # Gợi ý kernel thay thế (ít "gắt" hơn, thường dùng để làm nổi bật chi tiết):
    kernel = np.array([[0, -1, 0],
                       [-1, 5,-1],
                       [0, -1, 0]])
    # Hoặc, giảm nhẹ giá trị trung tâm của kernel gốc:
    # kernel = np.array([[-1,-1,-1], [-1,8.5,-1], [-1,-1,-1]]) # Giá trị trung tâm nhỏ hơn 9

    sharpened = cv2.filter2D(contrast, -1, kernel)

    # 6. Chèn sau sharpened nếu muốn: (Contrast stretching / Normalization)
    # Bước này rất quan trọng để tận dụng toàn bộ dải động 0-255.
    # Chất lượng của 'stretched' phụ thuộc nhiều vào chất lượng của 'sharpened'.
    min_val = np.min(sharpened)
    max_val = np.max(sharpened)
    # Để tránh lỗi chia cho 0 nếu max_val == min_val (ảnh hoàn toàn đồng màu sau khi sharpen)
    if max_val == min_val:
        stretched = sharpened # Hoặc gán một giá trị mặc định, ví dụ: np.zeros_like(sharpened)
    else:
        stretched = ((sharpened - min_val) / (max_val - min_val) * 255).astype(np.uint8)


    # 8. Perform OCR using EasyOCR
    results = reader.readtext(stretched)

    # 9. Combine and clean text
    plate_text = ''.join(res[1] for res in results)
    plate_text = sanitize_plate_text(plate_text)

    return plate_text, stretched


def is_valid_crop(crop_img, min_w=220, min_h=80, min_brightness=80):
    """
    Check if cropped image meets conditions for direct OCR.
    Conditions:
    - Width and height are large enough
    - Average brightness above threshold
    """
    if not isinstance(crop_img, np.ndarray):
        return False

    h, w = crop_img.shape[:2]
    if w < min_w or h < min_h:
        return False

    gray = cv2.cvtColor(crop_img, cv2.COLOR_BGR2GRAY)
    brightness = np.mean(gray)

    return brightness >= min_brightness

def detect_plate_yolo(img_cv):
    # 1. Convert OpenCV → RGB (YOLO cần RGB)
    img_rgb = cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB)

    # 2. Dự đoán
    results = model(img_rgb)

    # 3. Lấy bounding box đầu tiên (chính là vùng biển số)
    boxes = results[0].boxes.xyxy.cpu().numpy()  # x1, y1, x2, y2
    if len(boxes) == 0:
        raise ValueError("Không phát hiện được biển số")

    x1, y1, x2, y2 = boxes[0].astype(int)
    crop = img_cv[y1:y2, x1:x2]
    return crop

def run_alpr(ori_bytes):
    start_time = time.time()

    # 1. Convert bytes → OpenCV image
    npimg = np.frombuffer(ori_bytes, np.uint8)
    img_cv = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    # 2. OCR trên full ảnh gốc
    full_text = get_plate_text_from_image(img_cv)
    full_text = full_text if (
        len(full_text) <= 11 and
        # len(re.findall(r'[^A-Z0-9]', full_text)) <= 2 and
        len(re.findall(r'[A-Z]', full_text)) >= 1
    ) else ""
    plate_number = full_text
    processed_image = img_cv

    # Các biến mặc định
    crop_text = ""
    enhanced_text = ""

    # 3. YOLO detect + crop
    try:
        plate_crop = detect_plate_yolo(img_cv)
        if not isinstance(plate_crop, np.ndarray):
            raise ValueError("Ảnh crop không hợp lệ!")

        # 4. OCR trên crop
        if is_valid_crop(plate_crop):
            crop_text = get_plate_text_from_image(plate_crop)
            crop_text = crop_text if (
                len(crop_text) <= 11 and
                # len(re.findall(r'[^A-Z0-9]', crop_text)) <= 2 and
                len(re.findall(r'[A-Z]', crop_text)) >= 1
            ) else ""
            if len(crop_text) > len(plate_number):
                plate_number = crop_text
                processed_image = plate_crop
        else:
            enhanced_text, enhanced_img = enhanced_ocr(plate_crop)
            enhanced_text = enhanced_text if (
                len(enhanced_text) <= 11 and
                # len(re.findall(r'[^A-Z0-9]', enhanced_text)) <= 2 and
                len(re.findall(r'[A-Z]', enhanced_text)) >= 1
            ) else ""
            if len(enhanced_text) > len(plate_number):
                plate_number = enhanced_text
                processed_image = enhanced_img
    except Exception as e:
        pass  # fallback

    # 5. Nếu tất cả đều rỗng → ảnh không xử lý được
    if not any([full_text, crop_text, enhanced_text]):
        raise ValueError("Ảnh này không xử lý được vì không nhận diện được biển số hợp lệ.")

    # 6. Encode ảnh để trả
    success, buffer = cv2.imencode('.jpg', processed_image)
    if not success:
        raise ValueError("Chuyển ảnh crop sang định dạng bytes thất bại!")

    crop_bytes = buffer.tobytes()
    process_time = round(time.time() - start_time, 3)

    return {
        "crop_bytes": crop_bytes,
        "plate_number": plate_number,
        "process_time": process_time
    }
