from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from fastapi.staticfiles import StaticFiles
import uvicorn
import webbrowser
import threading
import time
import os

def create_application() -> FastAPI:
    application = FastAPI(
        title="ALPR System API",
        version="1.0.0",
        description="""
        # ALPR (Automatic License Plate Recognition) System API
        
        ## Overview
        This API provides endpoints for license plate recognition and management.
        
        ## Features
        * Upload and process license plate images
        * Real-time plate recognition
        * Plate information management
        * Historical data tracking
        
        ## Authentication
        All endpoints require authentication using API key.
        
        ## Rate Limiting
        API calls are limited to 100 requests per minute per API key.
        """,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        contact={
            "name": "HiTranquility",
            "url": "https://github.com/HiTranquility",
            "email": "thebeyondtranquility@gmail.com"
        },
        license_info={
            "name": "MIT",
            "url": "https://opensource.org/licenses/MIT"
        },
        terms_of_service="https://github.com/HiTranquility/ALPR-System/blob/main/LICENSE",
        swagger_ui_parameters={
            "defaultModelsExpandDepth": -1,
            "docExpansion": "none",
            "filter": True,
            "syntaxHighlight.theme": "monokai",
            "tryItOutEnabled": True,
            "displayRequestDuration": True,
            "persistAuthorization": True
        }
    )

    # CORS middleware
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # CORS: allow all origins for dev
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount static folder (nằm sau CORS, trước router)
    os.makedirs("static/original", exist_ok=True)
    os.makedirs("static/cropped", exist_ok=True)
    application.mount("/static", StaticFiles(directory="static"), name="static")

    # Include routers
    application.include_router(api_router, prefix="/api")

    return application

app = create_application()

def open_browser():
    webbrowser.open_new("http://localhost:8000/docs")

if __name__ == "__main__":
    threading.Thread(target=open_browser).start()
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        workers=1,
        http="httptools",
        log_level="info",
        access_log=True
    )

