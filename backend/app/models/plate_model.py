class PlateRecord:
    def __init__(
        self,
        id=None,
        image_url=None,          # ← thay vì image_data (bytes)
        crop_image_url=None,     # ← thay vì crop_image (bytes)
        plate_number=None,
        detected_at=None,
        left_at=None,
        process_time=None,
        source=None
    ):
        self.id = id
        self.image_url = image_url
        self.crop_image_url = crop_image_url
        self.plate_number = plate_number
        self.detected_at = detected_at
        self.left_at = left_at
        self.process_time = process_time
        self.source = source
