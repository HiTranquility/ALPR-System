FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (if needed)
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    pkg-config \
    default-libmysqlclient-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Download YOLO model if not present (edit the URL if you host the model elsewhere)
# RUN wget -O app/core/best.pt https://your-model-storage-url/best.pt

# Expose port 8000 for Render
EXPOSE 8000

# Production-ready start command for Render
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]