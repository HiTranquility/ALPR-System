from app.models.plate_model import PlateRecord
from app.models.mysql_connection import execute_non_query, fetch_one, fetch_all
from datetime import datetime

class PlateRepo:

    @staticmethod
    def create_plate(record: PlateRecord):
        query = """
            INSERT INTO plate_records (
                image_url,
                crop_image_url,
                plate_number,
                detected_at,
                process_time,
                source
            )
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        params = (
            record.image_url,
            record.crop_image_url,
            record.plate_number,
            record.detected_at or datetime.utcnow(),
            record.process_time,
            record.source
        )
        return execute_non_query(query, params)

    @staticmethod
    def get_plate_by_plate_number(plate_number: str):
        query = "SELECT * FROM plate_records WHERE plate_number = %s LIMIT 1"
        return fetch_one(query, (plate_number,))

    @staticmethod
    def find_by_request_fields(
        plate_number: str,
        source: str = None,
        detected_at: datetime = None,
        left_at: datetime = None
    ):
        sql = "SELECT * FROM plate_records WHERE plate_number = %s"
        params = [plate_number]

        if source:
            sql += " AND source = %s"
            params.append(source)
        if detected_at:
            sql += " AND detected_at = %s"
            params.append(detected_at)
        if left_at:
            sql += " AND left_at = %s"
            params.append(left_at)

        # Order by detected_at DESC to get most recent records first
        sql += " ORDER BY detected_at DESC"
        return fetch_all(sql, tuple(params))

    @staticmethod
    def get_all(size: int):
        query = "SELECT * FROM plate_records ORDER BY detected_at DESC LIMIT %s"
        return fetch_all(query, (size,))

    @staticmethod
    def update_plate(record: PlateRecord):
        query = """
            UPDATE plate_records
            SET
                image_url = %s,
                crop_image_url = %s,
                plate_number = %s,
                detected_at = %s,
                left_at = %s,
                process_time = %s,
                source = %s
            WHERE plate_number = %s
        """
        params = (
            record.image_url,
            record.crop_image_url,
            record.plate_number,
            record.detected_at,
            record.left_at,
            record.process_time,
            record.source,
            record.plate_number
        )
        return execute_non_query(query, params)

    @staticmethod
    def delete_by_plate_number(plate_number: str) -> bool:
        query = "DELETE FROM plate_records WHERE plate_number = %s"
        return execute_non_query(query, (plate_number,))

    @staticmethod
    def get_plate_by_plate_number_and_detected_at(plate_number: str, detected_at: str):
        query = "SELECT * FROM plate_records WHERE plate_number = %s AND detected_at = %s LIMIT 1"
        return fetch_one(query, (plate_number, detected_at))

    @staticmethod
    def delete_by_plate_number_and_detected_at(plate_number: str, detected_at: str) -> bool:
        query = "DELETE FROM plate_records WHERE plate_number = %s AND detected_at = %s"
        return execute_non_query(query, (plate_number, detected_at))

