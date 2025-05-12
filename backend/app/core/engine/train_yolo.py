# engine/train_yolo.py

import os
from ultralytics import YOLO

def train():
    # Xác định thư mục gốc chứa file train_yolo.py (thường là /engine)
    base_dir = os.path.dirname(os.path.abspath(__file__))

    # In ra để debug
    data_path = os.path.join(base_dir, "datasets", "data.yaml")
    print("🔍 BASE DIR:", base_dir)
    print("📄 Using data.yaml at:", data_path)

    # Load model YOLO gốc
    model = YOLO(os.path.join(base_dir, "untrained-models", "yolov8n.pt"))

    # Train model
    model.train(
        data=data_path,                                 # Đường dẫn tuyệt đối đến data.yaml
        epochs=50,
        imgsz=640,
        batch=16,
        project=os.path.join(base_dir, "outputs"),      # Kết quả lưu vào engine/outputs/
        name="weights",                                 # outputs/weights/
        workers=2,
        device="cpu"
    )

if __name__ == "__main__":
    train()
