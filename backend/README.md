# ALPR System - License Plate Recognition

This system provides automatic license plate recognition capabilities with a RESTful API interface.

## System Requirements

- Docker
- Docker Compose
- Git

## Quick Start

### Development Mode
For Windows:
```bash
dev.bat
```

For Linux/Mac:
```bash
chmod +x dev.sh
./dev.sh
```

This will:
- Stop any running containers
- Clean up old containers and volumes
- Create necessary directories
- Start the services in development mode
- Show real-time logs

The API will be available at http://localhost:8000/api

### Production Mode
1. Clone the repository:
```bash
git clone <repository-url>
cd alpr-system
```

2. Start the services:
```bash
docker-compose up -d
```

The system will be available at:
- API: http://localhost:8000/api
- Nginx: http://localhost

## API Endpoints

### Upload Single Image
```http
POST /api/plates/upload
Content-Type: multipart/form-data

file: <image_file>
```

### Upload Multiple Images
```http
POST /api/plates/upload-many
Content-Type: multipart/form-data

files: <image_files>
```

### Find Plate Records
```http
GET /api/plates/find?plate_number=<plate_number>
```

### Get All Plates
```http
GET /api/plates/get-all?size=<number>
```

### Delete Plate Record
```http
DELETE /api/plates/delete/<plate_number>
```

## ALPR Engine - License Plate Recognition Workflow

### Overview
The `alpr_engine` module is responsible for recognizing license plates from input images. The recognition workflow consists of the following main steps:

#### 1. Image Preprocessing
- The input image (in bytes) is converted to an OpenCV image (numpy array).
- A quick OCR check is performed on the original image using EasyOCR to attempt to recognize the license plate.

#### 2. License Plate Detection (YOLOv8)
- The YOLOv8 model (custom-trained for license plates) is used to detect the license plate region in the image.
- The license plate region is cropped based on the bounding box returned by YOLO.

#### 3. Character Recognition (OCR)
- If the cropped region is large and bright enough, OCR is performed directly using EasyOCR.
- If the crop is small or of low quality, several enhancement steps are applied:
  - Resize: Upscale the license plate image if it is too small.
  - Grayscale: Convert to grayscale.
  - Bilateral Filter: Denoise while preserving edges.
  - CLAHE: Apply local contrast enhancement.
  - Sharpen: Enhance edges using a sharpening kernel.
  - Contrast Stretching: Normalize the image dynamic range to 0-255.
- OCR is then performed on the enhanced image.

#### 4. Post-processing Results
- The recognized string is cleaned (keeping only A-Z, 0-9, hyphens, and dots).
- Results from all steps (full image, crop, enhanced) are compared, and the most valid, longest, and best-formatted string is selected.

#### 5. Return Results
- The recognized license plate string, cropped image (as bytes), and processing time are returned.

### Algorithms and Technologies Used
- YOLOv8: Detects the license plate region in the image (object detection).
- EasyOCR: Optical Character Recognition (OCR) for both Vietnamese and English.
- Image preprocessing: Resize, Grayscale, Bilateral Filter, CLAHE, Sharpen, Contrast Stretching.
- String post-processing: Clean up characters, validate format, select the best result.

## Deployment

### Local Development
1. Make sure Docker and Docker Compose are installed
2. Clone the repository
3. Run `docker-compose up -d`
4. Access the API at http://localhost:8000/api

### Production Deployment
1. **Prepare the Environment**
   - Ensure your server has Docker and Docker Compose installed.
   - (Recommended) Use Ubuntu 20.04+ or CentOS 7+ for the server.

2. **Clone the Source Code**
```bash
# On your server
sudo apt update && sudo apt install -y git
# Clone the project
cd /opt
sudo git clone <repository-url> alpr-system
cd alpr-system/backend
```

3. **Configure the Environment**
   - Edit `docker-compose.yml` to set production passwords, database info, and volumes as needed.
   - Edit `nginx.conf` if you want to configure a domain or SSL.

4. **Download the YOLO Model**
   - Ensure the file `app/core/best.pt` (YOLOv8 model) is present in the source. If not, copy the model to this location.

5. **Start the System**
```bash
docker-compose up -d --build
```

6. **Verify**
   - API: http://<server-ip>:8000/api
   - Nginx: http://<server-ip>

7. **Security**
   - Change all default passwords in `docker-compose.yml` before deploying to production.
   - Configure SSL for nginx if deploying in a real production environment.
   - Open only the necessary ports (80, 8000, 3306 if you need remote DB access).

8. **Backup Data**
```bash
docker exec alpr_db mysqldump -u root -p alpr_db > backup.sql
```

### Database Management
- The MySQL database is automatically initialized with the schema in `init.sql`
- Data is persisted in a Docker volume named `mysql_data`
- To backup the database:
```bash
docker exec alpr_db mysqldump -u root -p alpr_db > backup.sql
```

### Environment Variables
Key environment variables in `docker-compose.yml`:
- `MYSQL_ROOT_PASSWORD`: Root password for MySQL
- `MYSQL_DATABASE`: Database name
- `MYSQL_USER`: Database user
- `MYSQL_PASSWORD`: Database password

## Troubleshooting

### Common Issues
1. Port conflicts:
   - Check if ports 80, 8000, or 3306 are already in use
   - Modify ports in docker-compose.yml if needed

2. Database connection issues:
   - Ensure MySQL container is running: `docker ps`
   - Check logs: `docker logs alpr_db`

3. API not responding:
   - Check backend logs: `docker logs alpr_backend`
   - Check nginx logs: `docker logs alpr_nginx`

### Logs
View logs for specific services:
```bash
docker logs alpr_backend  # Backend logs
docker logs alpr_db      # Database logs
docker logs alpr_nginx   # Nginx logs
```

## Security Considerations

1. Change default passwords in production
2. Configure SSL/TLS in Nginx for production
3. Set up proper firewall rules
4. Regularly backup the database
5. Keep Docker images updated

## Maintenance

### Updating the System
1. Pull latest changes:
```bash
git pull
```

2. Rebuild and restart containers:
```bash
docker-compose down
docker-compose up -d --build
```

### Database Backup
Regular backup schedule recommended:
```bash
# Create backup
docker exec alpr_db mysqldump -u root -p alpr_db > backup_$(date +%Y%m%d).sql

# Restore from backup
docker exec -i alpr_db mysql -u root -p alpr_db < backup.sql
```