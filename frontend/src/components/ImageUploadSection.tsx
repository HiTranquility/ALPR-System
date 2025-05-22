import type React from "react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import type { ProcessedImage } from "@/types";
import { plateService } from "@/api/plateService";
import { toast } from "sonner";

interface ImageUploadSectionProps {
  onImageProcessed: (result: ProcessedImage) => void;
}

export function ImageUploadSection({ onImageProcessed }: ImageUploadSectionProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedImages(Array.from(files));
    }
  };

  const handleProcessImages = async () => {
    if (selectedImages.length === 0) return;
  
    setIsProcessing(true);
    setProgress(0);
  
    try {
      // Always use multiple image processing
      const result = await plateService.uploadManyPlates(selectedImages);
  
      if (result.success) {
        for (let i = 0; i < result.data.length; i++) {
          const item = result.data[i];
  
          const currentProgress = ((i + 1) / result.data.length) * 100;
          setProgress(currentProgress);
  
          if (result.success) {
            // Create processed image data
            const processedImage: ProcessedImage = {
              id: Date.now().toString() + i,
              originalImage: item.image_url,
              croppedImage: item.crop_image_url,
              licensePlate: item.plate_number,
              processingSpeed: item.process_time,
              detectionTime: item.detected_at ? new Date(item.detected_at).toLocaleString() : "N/A",
              timestamp: new Date(item.detected_at).getTime() || Date.now(),
            };
  
            onImageProcessed(processedImage);
            toast.success(`Ảnh ${i + 1}/${result.data.length} xử lý thành công!`);
          } else {
            // Show error for this image
            toast.error(`Ảnh ${i + 1}: ${result.message || "Xử lý thất bại!"}`);
          }
  
          // Show processing message
          toast.info(`Đang xử lý ảnh ${i + 1}/${result.data.length}...`);
  
          // Wait for 2 seconds before processing next image
          if (i < result.data.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
  
        toast.success(result.message || `Đã xử lý xong ${result.total || result.data.length} ảnh!`);
      } else {
        toast.error(result.message || "Có lỗi xảy ra khi xử lý ảnh!");
      }
    } catch (error) {
      console.error("Error processing images:", error);
      toast.error("Có lỗi xảy ra khi xử lý ảnh!");
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };
  

  const clearSelectedImages = () => {
    setSelectedImages([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleImageSelect} variant="outline">
          Chọn ảnh
        </Button>
        <Button
          onClick={handleProcessImages}
          disabled={selectedImages.length === 0 || isProcessing}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isProcessing ? "Đang xử lý..." : "Bắt đầu xử lý ảnh"}
        </Button>
        {selectedImages.length > 0 && (
          <Button variant="destructive" onClick={clearSelectedImages}>
            Xóa ảnh đã chọn
          </Button>
        )}
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        multiple
        className="hidden"
      />

      {isProcessing && (
        <div className="w-full my-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.round(progress)}%` }}
              />
            </div>
            <span className="font-semibold text-blue-700 w-10 text-right">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      )}

      {selectedImages.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between mb-2">
              <h3 className="font-semibold">Ảnh đã chọn ({selectedImages.length})</h3>
            </div>
            <ScrollArea className="h-64 w-full">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedImages.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <div className="mt-1 text-xs truncate">{file.name}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
