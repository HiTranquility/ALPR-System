import os

# 🧠 BASE_DIR là thư mục chứa file này (ví dụ: backend/app/core hoặc backend/app/utils)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 🎯 STATIC_ROOT là thư mục backend/static (ra khỏi app/)
STATIC_ROOT = os.path.abspath(os.path.join(BASE_DIR, "..", "..", "static"))

def save_bytes_image(image_bytes: bytes, file_path: str):
    """
    Lưu ảnh vào backend/static/... đúng thư mục thực tế.
    file_path: thường là '/static/original/abc.jpg' hoặc '/static/cropped/...'
    """
    if file_path.startswith("/static/"):
        file_path = file_path[len("/static/"):]  # Bỏ phần /static/

    full_path = os.path.join(STATIC_ROOT, file_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)

    with open(full_path, "wb") as f:
        f.write(image_bytes)