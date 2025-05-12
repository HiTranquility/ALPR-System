import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Thư mục chứa file này (app/core/)

def sanitize_plate(plate_number: str) -> str:
    """
    Loại bỏ ký tự không hợp lệ để đảm bảo tên file an toàn
    """
    return "".join(c for c in plate_number if c.isalnum() or c in ("-", "_")).replace(" ", "_")

def generate_original_image_url(plate_number: str) -> str:
    safe_name = sanitize_plate(plate_number)
    return f"/static/original/{safe_name}.jpg"

def generate_cropped_image_url(plate_number: str) -> str:
    safe_name = sanitize_plate(plate_number)
    return f"/static/cropped/{safe_name}_crop.jpg"
