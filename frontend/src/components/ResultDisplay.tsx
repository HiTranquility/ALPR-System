import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProcessedImage } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ResultDisplayProps {
  result: ProcessedImage | null;
}

export function ResultDisplay({ result }: ResultDisplayProps) {
  if (!result) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent>
          <p className="text-center text-gray-500">
            Chưa có kết quả xử lý. Vui lòng tải lên và xử lý ảnh.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Helper for original image
  const getOriginalImageUrl = (imageUrl: string | undefined) => {
    // Nếu đã là URL đầy đủ (có thể là URL local từ createObjectURL)
    if (imageUrl && (imageUrl.startsWith('blob:') || imageUrl.startsWith('http'))) {
      return imageUrl;
    }
    
    // Xử lý URL từ API
    if (!imageUrl) return null;
    const filename = imageUrl.split('/').pop();
    if (!filename) return null;
    return `http://localhost:8000/static/original/${filename}`;
  };

  // Helper for cropped image
  const getCroppedImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return null;
    
    // Nếu đã là URL đầy đủ
    if (imageUrl.startsWith('blob:') || imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    const filename = imageUrl.split('/').pop();
    if (!filename) return null;
    return `http://localhost:8000/static/cropped/${filename}`;
  };

  const originalImageUrl = getOriginalImageUrl(result.originalImage);
  const croppedImageUrl = getCroppedImageUrl(result.croppedImage);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Kết quả xử lý ảnh</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {result.hasError && (
          <Alert variant="destructive" className="bg-red-100 border-red-400 border-2">
            <AlertDescription className="text-red-700 font-medium text-base">
              {result.errorMessage || "Không xử lý được ảnh, chuyển qua ảnh kế tiếp"}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Ảnh gốc</h3>
            <div className="w-full h-48 overflow-hidden rounded-md">
              <img
                src={originalImageUrl || ''}
                alt="Original"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Biển số xe đã cắt</h3>
            <div className="w-full h-48 overflow-hidden rounded-md bg-gray-100">
              {croppedImageUrl ? (
                <img
                  src={croppedImageUrl}
                  alt="Cropped plate"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className={`text-center ${result.hasError ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                    {result.hasError 
                      ? "Không thể xử lý biển số xe" 
                      : "Không tìm thấy biển số xe"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div>
              <span className="font-semibold">Biển số xe: </span>
              <span className={`font-mono text-lg ${result.hasError ? 'text-red-600' : 'text-blue-600'}`}>
                {result.licensePlate || "Không xác định"}
              </span>
            </div>
            <div>
              <span className="font-semibold">Thời gian nhận diện: </span>
              <span>{result.detectionTime || "N/A"}</span>
            </div>
          </div>
          <div>
            <div>
              <span className="font-semibold">Tốc độ xử lý: </span>
              <span className="text-green-600">
                {result.processingSpeed ? `${result.processingSpeed} ms` : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
