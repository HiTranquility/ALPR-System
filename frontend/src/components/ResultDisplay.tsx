import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProcessedImage } from "@/types";

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

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Kết quả xử lý ảnh</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Ảnh gốc</h3>
            <div className="w-full h-48 overflow-hidden rounded-md">
              <img
                src={result.originalImage}
                alt="Original"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Biển số xe đã cắt</h3>
            <div className="w-full h-48 overflow-hidden rounded-md bg-gray-100">
              {result.croppedImage ? (
                <img
                  src={result.croppedImage}
                  alt="Cropped plate"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Không tìm thấy biển số xe</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div>
              <span className="font-semibold">Biển số xe: </span>
              <span className="text-blue-600 font-mono text-lg">
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
