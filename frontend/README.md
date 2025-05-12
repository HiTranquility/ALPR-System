# Ứng dụng Nhận diện Biển số xe

Ứng dụng React hiển thị giao diện người dùng cho hệ thống nhận diện biển số xe. Ứng dụng này cho phép người dùng tải lên ảnh và xử lý chúng để trích xuất biển số xe, lưu trữ và tìm kiếm kết quả.

## Tính năng

- Tải lên một hoặc nhiều ảnh
- Xử lý ảnh và nhận diện biển số xe
- Hiển thị kết quả với thông tin về biển số xe, thời gian nhận diện và tốc độ xử lý
- Tìm kiếm biển số xe đã nhận diện
- Xem lịch sử nhận diện

## Cài đặt và Chạy

### Yêu cầu

- [Node.js](https://nodejs.org/) phiên bản 18+ hoặc [Bun](https://bun.sh/)
- [Docker](https://www.docker.com/) (nếu sử dụng Docker)

### Cách 1: Chạy trực tiếp

```bash
# Clone repository
git clone <repository-url>
cd license-plate-detection

# Cài đặt dependencies
bun install

# Chạy ứng dụng ở chế độ development
bun run dev

# Build ứng dụng cho production
bun run build

# Chạy phiên bản đã build
bun run preview
```

### Cách 2: Sử dụng Docker

#### Môi trường Development

```bash
# Xây dựng và chạy container development
docker-compose up license-plate-app-dev
```

Ứng dụng sẽ khả dụng tại http://localhost:5173

#### Môi trường Production

```bash
# Xây dựng và chạy container production
docker-compose up license-plate-app-prod
```

Ứng dụng sẽ khả dụng tại http://localhost:80

#### Xây dựng và chạy riêng lẻ

```bash
# Xây dựng image development
docker build -t license-plate-app:dev -f Dockerfile.dev .

# Chạy container development
docker run -p 5173:5173 -v $(pwd):/app license-plate-app:dev

# Xây dựng image production
docker build -t license-plate-app:prod .

# Chạy container production
docker run -p 80:80 license-plate-app:prod
```

## Cấu trúc Dự án

- `src/components/`: Các component React
- `src/services/`: Logic xử lý ảnh và quản lý dữ liệu
- `src/types.ts`: Các kiểu dữ liệu TypeScript
- `docker/`: Cấu hình liên quan đến Docker

## Triển khai lên Production

Ứng dụng có thể được triển khai lên các nền tảng như:

- Netlify
- Vercel
- AWS S3 + CloudFront
- Bất kỳ máy chủ web nào hỗ trợ nội dung tĩnh

### Triển khai bằng Docker

1. Xây dựng image production:
   ```bash
   docker build -t license-plate-app:prod .
   ```

2. Đẩy image lên container registry (Docker Hub, AWS ECR, etc.)
   ```bash
   docker tag license-plate-app:prod your-registry/license-plate-app:latest
   docker push your-registry/license-plate-app:latest
   ```

3. Triển khai container trên máy chủ production của bạn
   ```bash
   docker run -d -p 80:80 your-registry/license-plate-app:latest
   ```

## Lưu ý

- Hiện tại, ứng dụng mô phỏng việc xử lý ảnh bằng cách tạo dữ liệu ngẫu nhiên
- Trong môi trường thực tế, cần tích hợp với API xử lý ảnh thực tế hoặc mô hình nhận diện biển số xe

## License

MIT
