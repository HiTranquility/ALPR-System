# Dockerfile cho ứng dụng license-plate-detection
# Multi-stage build để tối ưu kích thước image

# Stage 1: Build ứng dụng
FROM oven/bun:latest as build

WORKDIR /app

# Sao chép package.json và bun.lock để tối ưu layer caching
COPY package.json bun.lock* ./

# Cài đặt dependencies
RUN bun install --frozen-lockfile

# Sao chép toàn bộ mã nguồn
COPY . .

# Build ứng dụng
RUN bun run build

# Stage 2: Production image
FROM nginx:alpine

# Sao chép các file cấu hình nginx
COPY ./docker/nginx.conf /etc/nginx/conf.d/default.conf

# Sao chép build từ stage trước vào thư mục serve của nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Khởi động nginx
CMD ["nginx", "-g", "daemon off;"]
