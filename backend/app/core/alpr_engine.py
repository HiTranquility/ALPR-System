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

# Initialize OCR reader and YOLO model
reader = easyocr.Reader(['en', 'vi'])
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # core/
MODEL_PATH = os.path.join(BASE_DIR, "best.pt")
model = YOLO(MODEL_PATH)

# Text Processing Functions
def sanitize_plate_text(text):
    """
    Clean OCR string from license plate:
    - Remove special characters, keep A-Z, 0-9, hyphens and dots
    - Convert to uppercase
    """
    text = text.upper()
    text = re.sub(r'[^A-Z0-9\-.]', '', text)
    return text

def get_plate_text_from_image(img):
    """
    Perform OCR and return cleaned license plate string
    """
    results = reader.readtext(img)
    text_raw = ''.join(res[1] for res in results)
    return sanitize_plate_text(text_raw)

# Image Validation Functions
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

    results = reader.readtext(img_cv)
    text_try = ''.join(res[1] for res in results)
    plate_text = sanitize_plate_text(text_try)

    return True, plate_text

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

# Plate Detection Functions
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

# Image Enhancement Functions
def enhanced_ocr(plate_crop):
    """
    Enhance image quality for better OCR results
    """
    # 1. Resize if image is too small while maintaining aspect ratio
    h, w = plate_crop.shape[:2]
    if w < 200 or h < 80:
        scale_factor = 2.0
        plate_crop = cv2.resize(plate_crop, None, fx=scale_factor, fy=scale_factor, interpolation=cv2.INTER_CUBIC)

    # 2. Convert to grayscale
    gray = cv2.cvtColor(plate_crop, cv2.COLOR_BGR2GRAY)

    # 3. Reduce noise while preserving edges using bilateral filter
    filtered = cv2.bilateralFilter(gray, 11, 17, 17)

    # 4. Enhance contrast using CLAHE
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    contrast = clahe.apply(filtered)

    # 5. Sharpen image using sharpening kernel
    kernel = np.array([[-1, -1, -1],
                       [-1,  9, -1],
                       [-1, -1, -1]])
    sharpened = cv2.filter2D(contrast, -1, kernel)

    # 6. Perform OCR
    results = reader.readtext(sharpened)

    # 7. Combine and clean text
    plate_text = ''.join(res[1] for res in results)
    plate_text = sanitize_plate_text(plate_text)

    return plate_text, sharpened

# Main ALPR Function
def run_alpr(ori_bytes):
    """
    Main function to process license plate images
    """
    start_time = time.time()

    # 1. Convert bytes to OpenCV image
    npimg = np.frombuffer(ori_bytes, np.uint8)
    img_cv = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    # 2. OCR on full original image
    full_text = get_plate_text_from_image(img_cv)
    plate_number = full_text
    processed_image = img_cv

    # 3. YOLO detection and cropping
    try:
        plate_crop = detect_plate_yolo(img_cv)
        if not isinstance(plate_crop, np.ndarray):
            raise ValueError("Invalid cropped image!")

        # 4. OCR on cropped image
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
        pass  # fallback: use original image and full_text

    # 5. Encode image for return
    success, buffer = cv2.imencode('.jpg', processed_image)
    if not success:
        raise ValueError("Failed to convert cropped image to bytes!")

    crop_bytes = buffer.tobytes()
    process_time = round(time.time() - start_time, 3)

    return {
        "crop_bytes": crop_bytes,
        "plate_number": plate_number,
        "process_time": process_time
    }



