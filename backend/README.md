# ALPR System - License Plate Recognition

This system provides automatic license plate recognition capabilities with a RESTful API interface.

## System Requirements

- Docker
- Docker Compose
- Git

## Quick Start

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

## Deployment

### Local Development
1. Make sure Docker and Docker Compose are installed
2. Clone the repository
3. Run `docker-compose up -d`
4. Access the API at http://localhost:8000/api

### Production Deployment
1. Set up a server with Docker and Docker Compose installed
2. Clone the repository to the server
3. Update the following files for production:
   - `docker-compose.yml`: Update environment variables
   - `nginx.conf`: Configure SSL and domain settings
4. Run `docker-compose up -d`

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