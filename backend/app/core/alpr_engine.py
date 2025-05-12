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
    Trả về: (crop_img, bounding_box)
    - crop_img: ảnh biển số đã cắt
    - bounding_box: tuple (x1, y1, x2, y2)
    """
    img_rgb = cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB)
    results = model(img_rgb)

    boxes = results[0].boxes.xyxy.cpu().numpy()
    if len(boxes) == 0:
        raise ValueError("Không phát hiện được biển số")

    x1, y1, x2, y2 = boxes[0].astype(int)
    crop = img_cv[y1:y2, x1:x2]
    return crop, (x1, y1, x2, y2)

def is_valid_full_image(img_cv, min_w=160, min_h=60, min_brightness=60):
    """
    Chạy OCR sớm trên ảnh gốc. Nếu hợp lý → trả text.
    Trả về: (bool is_valid, str plate_text)
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

    # ✨ OCR thử luôn
    results = reader.readtext(img_cv)
    text_try = ''.join(res[1] for res in results)
    plate_text = sanitize_plate_text(text_try)

    return True, plate_text


def enhanced_ocr(plate_crop):
    # 1. Resize nếu ảnh quá nhỏ → giữ nguyên tỷ lệ
    h, w = plate_crop.shape[:2]
    if w < 200 or h < 80:
        scale_factor = 2.0
        plate_crop = cv2.resize(plate_crop, None, fx=scale_factor, fy=scale_factor, interpolation=cv2.INTER_CUBIC)

    # 2. Grayscale
    gray = cv2.cvtColor(plate_crop, cv2.COLOR_BGR2GRAY)

    # 3. Giảm nhiễu, giữ biên bằng bilateral filter
    filtered = cv2.bilateralFilter(gray, 11, 17, 17)

    # 4. Tăng tương phản bằng CLAHE
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    contrast = clahe.apply(filtered)

    # 5. Làm nét ảnh bằng sharpening kernel
    kernel = np.array([[-1, -1, -1],
                       [-1,  9, -1],
                       [-1, -1, -1]])
    sharpened = cv2.filter2D(contrast, -1, kernel)

    # 6. OCR bằng EasyOCR
    results = reader.readtext(sharpened)

    # 7. Ghép text lại và làm sạch
    plate_text = ''.join(res[1] for res in results)
    plate_text = sanitize_plate_text(plate_text)


    return plate_text, sharpened


def is_valid_crop(crop_img, min_w=220, min_h=80, min_brightness=80):
    """
    Kiểm tra xem ảnh crop có đủ điều kiện để OCR trực tiếp không.
    Điều kiện:
    - Chiều rộng và chiều cao đủ lớn
    - Độ sáng trung bình cao hơn ngưỡng
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
    plate_number = full_text
    processed_image = img_cv

    # 3. YOLO detect + crop
    try:
        plate_crop = detect_plate_yolo(img_cv)
        if not isinstance(plate_crop, np.ndarray):
            raise ValueError("Ảnh crop không hợp lệ!")

        # 4. OCR trên crop
        if is_valid_crop(plate_crop):
            crop_text = get_plate_text_from_image(plate_crop)
            if len(crop_text) > len(full_text):
                plate_number = crop_text
                processed_image = plate_crop
        else:
            enhanced_text, enhanced_img = enhanced_ocr(plate_crop)
            if len(enhanced_text) > len(full_text):
                plate_number = enhanced_text
                processed_image = enhanced_img
    except Exception as e:
        pass  # fallback: dùng ảnh gốc và full_text luôn

    # 5. Encode ảnh để trả
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



