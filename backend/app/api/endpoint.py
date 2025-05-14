from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from typing import Optional, List
from app.services.plate_service import PlateService
from app.dtos.PlateResponse import PlateResponse
from app.dtos.BaseResponse import BaseResponse
from datetime import datetime

router = APIRouter(prefix="/plates", tags=["plates"])

# ✅ Upload plate image
@router.post("/upload", response_model=BaseResponse)
async def upload_plate(file: UploadFile = File(...)):
    try:
        result = await PlateService.process_image(file)
        PlateService.create_record(
            plate_number=result["plate_number"],
            image_url=result["image_url"],
            crop_image_url=result["crop_image_url"],
            process_time=result["process_time"],
            source="upload"
        )
        return {
            "success": True,
            "total": 1,
            "message": "Image uploaded successfully",
            "data": [PlateResponse(**result)]
        }
    except Exception as e:
        return {
            "success": False,
            "total": 0,
            "message": f"Image processing failed: {e}",
            "data": []
        }

# ✅ Upload multiple plate images
@router.post("/upload-many", response_model=BaseResponse)
async def upload_many_plates(files: List[UploadFile] = File(...)):
    if not files:
        return {
            "success": False,
            "total": 0,
            "message": "No files were uploaded.",
            "data": []
        }
    results = []
    for file in files:
        try:
            result = await PlateService.process_image(file)
            PlateService.create_record(
                plate_number=result["plate_number"],
                image_url=result["image_url"],
                crop_image_url=result["crop_image_url"],
                process_time=result["process_time"],
                source="upload"
            )
            results.append(PlateResponse(**result))
        except Exception as e:
            return {
                "success": False,
                "total": 0,
                "message": f"Image processing failed: {e}",
                "data": []
            }

    return {
        "success": True,
        "total": len(results),
        "message": "Multiple images uploaded successfully",
        "data": results
    }

# ✅ Find by plate number
@router.get("/find", response_model=BaseResponse)
async def find_plate(
    plate_number: str = Query(...),
    source: Optional[str] = None,
    detected_at: Optional[str] = None,
    left_at: Optional[str] = None
):
    plates = PlateService.find_by_request(
        plate_number=plate_number,
        source=source,
        detected_at=detected_at,
        left_at=left_at
    )
    if plates:
        return {
            "success": True,
            "total": len(plates),
            "message": f"Found {len(plates)} record(s) for plate number {plate_number}",
            "data": plates
        }
    return {
        "success": False,
        "total": 0,
        "message": f"No records found for plate number {plate_number}",
        "data": []
    }

# ✅ Get all plates
@router.get("/get-all", response_model=BaseResponse)
async def get_all_plates(size: int = Query(..., ge=1)):
    try:
        plates = PlateService.get_all_plates(size)
        if len(plates) == 0:
            return {
                "success": True,
                "total": 0,
                "message": "Database is currently empty",
                "data": []
            }
        return {
            "success": True,
            "total": len(plates),
            "message": "Successfully retrieved all plate numbers",
            "data": plates
        }
    except Exception as e:
        return {
            "success": False,
            "total": 0,
            "message": f"Error retrieving plate numbers: {e}",
            "data": []
        }

# ✅ Delete by plate number
@router.delete("/delete", response_model=BaseResponse)
async def delete_plate(
    plate_number: str = Query(...),
    detected_at: str = Query(None)
):
    try:
        success = PlateService.delete_record(plate_number, detected_at)
        if success:
            return {
                "success": True,
                "total": 1,
                "message": f"Plate number {plate_number} deleted successfully",
                "data": []
            }
        else:
            return {
                "success": False,
                "total": 0,
                "message": f"Plate number {plate_number} does not exist",
                "data": []
            }
    except Exception as e:
        return {
            "success": False,
            "total": 0,
            "message": f"Error deleting plate number {plate_number}: {e}",
            "data": []
        }
