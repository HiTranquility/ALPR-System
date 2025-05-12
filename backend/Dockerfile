FROM python:3.13-slim

WORKDIR /app

# Cài các thư viện hệ thống cần thiết
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libgl1 \
    libglib2.0-0 \
    && apt-get clean

COPY . .

RUN pip install --upgrade pip && pip install -r requirements.txt

# Hoặc cài thủ công:
RUN pip install fastapi uvicorn[standard] python-dotenv mysql-connector-python

CMD ["python", "main.py"]