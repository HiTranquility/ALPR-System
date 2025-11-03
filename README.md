# ALPR System - Automatic License Plate Recognition

## Giới thiệu
Đây là hệ thống nhận diện biển số xe tự động (ALPR - Automatic License Plate Recognition) với khả năng nhận diện biển số từ hình ảnh thông qua API và giao diện web. Hệ thống sử dụng các công nghệ hiện đại như YOLOv8 (phát hiện biển số), EasyOCR (nhận diện ký tự), React (frontend) và vận hành đa nền tảng với Docker.

## Chức năng chính
- Tải lên một hoặc nhiều ảnh để nhận diện biển số xe
- Hiển thị kết quả nhận diện: số xe, thời gian nhận diện, tốc độ xử lý
- Tìm kiếm, lưu trữ và quản lý lịch sử biển số đã nhận diện
- API RESTful cho phép tích hợp với hệ thống khác

## Công nghệ sử dụng
- **Backend:** Python, FastAPI, YOLOv8, EasyOCR, MySQL, Docker
- **Frontend:** React, TypeScript, Vite, TailwindCSS, Radix UI

## Hướng dẫn chạy nhanh
### Yêu cầu
- Docker & Docker Compose
- (Nếu phát triển frontend riêng: Node.js 18+ hoặc Bun)

### Chạy toàn bộ hệ thống bằng Docker
```bash
git clone <repository-url>
cd ALPR-System/backend
python main.py
```
- API backend: http://localhost:8000/docs
- Giao diện web: 

### Chạy frontend riêng (phát triển)
```bash
cd ALPR-System/frontend
bun install # hoặc npm install
bun run dev # hoặc npm run dev
```
- Truy cập: http://localhost:5173

## Thông tin người thực hiện
- **Họ tên:** Nguyễn Tấn Phát
- **MSSV:** 22110060
- **Github:** [HiTranquility](https://github.com/HiTranquility)
- **Email:** thebeyondtranquility@gmail.com
