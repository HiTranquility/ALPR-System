import type { ProcessedImage } from "../types";

// Mô phỏng xử lý ảnh, trong thực tế sẽ gọi API hoặc thực hiện xử lý ảnh thực sự
export const processImage = (imageFile: File): Promise<ProcessedImage> => {
  return new Promise((resolve) => {
    const startTime = performance.now();
    const reader = new FileReader();

    reader.onload = (e) => {
      // Mô phỏng thời gian xử lý từ 500ms đến 2000ms
      const processingTime = Math.random() * 1500 + 500;

      setTimeout(() => {
        const endTime = performance.now();
        const originalImage = e.target?.result as string;

        // Mô phỏng kết quả xử lý
        const result: ProcessedImage = {
          id: Math.random().toString(36).substring(2, 15),
          originalImage,
          croppedImage: originalImage, // Trong thực tế sẽ là ảnh đã được cắt
          licensePlate: generateRandomLicensePlate(),
          detectionTime: new Date().toLocaleString(),
          processingSpeed: Math.round(endTime - startTime),
          timestamp: Date.now()
        };

        resolve(result);
      }, processingTime);
    };

    reader.readAsDataURL(imageFile);
  });
};

// Tạo biển số xe ngẫu nhiên
const generateRandomLicensePlate = (): string => {
  const prefixes = ['29', '30', '31', '32', '33', '34', '51', '59', '60'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const letters = 'ABCDEFGHKLMNPRSTUVXYZ';
  const letter1 = letters[Math.floor(Math.random() * letters.length)];
  const letter2 = letters[Math.floor(Math.random() * letters.length)];
  const numbers = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

  return `${prefix}${letter1}${letter2}-${numbers}`;
};

// Lưu trữ dữ liệu các ảnh đã xử lý
let processedImages: ProcessedImage[] = [];

// Thêm ảnh đã xử lý vào danh sách
export const addProcessedImage = (image: ProcessedImage): void => {
  processedImages = [image, ...processedImages];
};

// Lấy tất cả ảnh đã xử lý
export const getAllProcessedImages = (): ProcessedImage[] => {
  return processedImages;
};

// Tìm kiếm ảnh theo biển số xe
export const searchByLicensePlate = (query: string): ProcessedImage[] => {
  if (!query.trim()) return [];

  return processedImages.filter(
    (image) => image.licensePlate?.toLowerCase().includes(query.toLowerCase())
  );
};
