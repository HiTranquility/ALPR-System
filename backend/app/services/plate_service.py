# from app.core.run_alpr import run_alpr
from app.utils.generate_url import generate_original_image_url, generate_cropped_image_url
from app.utils.file import save_bytes_image
from app.models.plate_model import PlateRecord
from app.dtos.PlateRequest import PlateRequest
from app.repositories.plate_repository import PlateRepo
from datetime import datetime
from app.core.alpr_engine import run_alpr
import os

class PlateService:
    @staticmethod
    async def process_image(file):
        image_bytes = await file.read()

        # 1. Run ALPR
        result = run_alpr(image_bytes)
        plate_number = result["plate_number"]
        crop_bytes = result["crop_bytes"]
        process_time = result["process_time"]
        orig_bytes = image_bytes  

        # 2. Generate URLs
        orig_url = generate_original_image_url(plate_number)
        crop_url = generate_cropped_image_url(plate_number)

        # 3. Save images
        save_bytes_image(orig_bytes, orig_url)
        save_bytes_image(crop_bytes, crop_url)

        return {
            "plate_number": plate_number,
            "image_url": orig_url,
            "crop_image_url": crop_url,
            "process_time": process_time  # 👈 thêm dòng này
        }

    @staticmethod
    def create_record(plate_number: str, image_url: str, crop_image_url: str, process_time: float, source: str):
        record = PlateRecord(
            image_url=image_url,
            crop_image_url=crop_image_url,
            plate_number=plate_number,
            detected_at=datetime.now(),
            left_at=None,
            process_time=process_time,
            source=source
        )
        return PlateRepo.create_plate(record)

    @staticmethod
    def find_by_request(
        plate_number: str,
        source: str = None,
        detected_at: str = None,
        left_at: str = None
    ):
        return PlateRepo.find_by_request_fields(
            plate_number=plate_number,
            source=source,
            detected_at=detected_at,
            left_at=left_at
        )

    @staticmethod
    def get_all_plates(size: int):
        return PlateRepo.get_all(size)
    
    @staticmethod
    def delete_record(plate_number: str, detected_at: str = None) -> bool:
        # Lấy thông tin bản ghi đúng với plate_number và detected_at
        record = PlateRepo.get_plate_by_plate_number_and_detected_at(plate_number, detected_at)
        if not record:
            return False

        # Xoá ảnh liên quan
        for path in [record.get("image_url"), record.get("crop_image_url")]:
            if path:
                file_path = os.path.join(*path.strip("/").split("/"))
                if os.path.exists(file_path):
                    os.remove(file_path)

        # Gọi repo để xoá bản ghi trong DB
        return PlateRepo.delete_by_plate_number_and_detected_at(plate_number, detected_at)
    
