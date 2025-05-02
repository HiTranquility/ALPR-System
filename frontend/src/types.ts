// Định nghĩa các kiểu dữ liệu cho ứng dụng

// Kiểu dữ liệu cho ảnh đã xử lý
export interface ProcessedImage {
  id: string;
  originalImage: string;
  croppedImage?: string;
  licensePlate?: string;
  detectionTime?: string;
  processingSpeed?: number;
  timestamp: number;
}

// Kiểu dữ liệu cho kết quả tìm kiếm
export interface SearchResult {
  id: string;
  licensePlate: string;
  detectionTime: string;
  croppedImage: string;
}
