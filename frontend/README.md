# ALPR System Frontend

Frontend application for the Automatic License Plate Recognition (ALPR) System.

## Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- Docker (optional, for containerized deployment)

## Installation

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your environment variables:
```env
VITE_API_URL=your_api_url
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Docker Development

1. Build the development Docker image:
```bash
docker build -t alpr-frontend-dev -f docker/Dockerfile.dev .
```

2. Run the development container:
```bash
docker run -p 5173:5173 -v $(pwd):/app alpr-frontend-dev
```

The application will be available at `http://localhost:5173` with hot-reload support.

### Docker Production Deployment

1. Build the production Docker image:
```bash
docker build -t alpr-frontend .
```

2. Run the production container:
```bash
docker run -p 80:80 alpr-frontend
```

The application will be available at `http://localhost`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
frontend/
├── src/              # Source files
├── public/           # Static files
├── docker/           # Docker configuration
│   ├── Dockerfile    # Production Dockerfile
│   └── Dockerfile.dev # Development Dockerfile
├── .env              # Environment variables
└── package.json      # Project dependencies
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:8000 |

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

[Your License]
