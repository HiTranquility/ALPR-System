# 🚘 ALPR YOLOv8 – Nhận diện Biển Số Xe

Dự án dùng YOLOv8 để huấn luyện mô hình nhận diện biển số xe từ ảnh.

---

## 📁 Cấu trúc thư mục

---

engine/
├── datasets/
│ ├── images/
│ │ ├── train/ ← ảnh huấn luyện
│ │ └── val/ ← ảnh kiểm thử
│ ├── labels/
│ │ ├── train/ ← nhãn YOLO (txt) cho ảnh train
│ │ └── val/ ← nhãn YOLO (txt) cho ảnh val
│ └── data.yaml ← file cấu hình dữ liệu
│
├── untrained-models/ ← chứa YOLO model gốc (.pt)
│ └── yolov8n.pt
│
├── train_yolo.py ← script chạy huấn luyện
└── README.md

---

## 🧠 Cài đặt

---

```bash
pip install ultralytics
```

---

## 🚀 Chạy huấn luyện

---

```bash
cd engine
python train_yolo.py
```

---

## 📦 Kết quả sau khi train

---

runs/detect/yolov8n_plate/
├── weights/
│   ├── best.pt       ← mô hình tốt nhất
│   └── last.pt       ← mô hình cuối cùng
├── results.png       ← biểu đồ loss, precision, recall
└── ...
