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
      // Process each image one by one to handle individual errors better
      for (let i = 0; i < selectedImages.length; i++) {
        const file = selectedImages[i];
        const currentProgress = ((i + 1) / selectedImages.length) * 100;
        setProgress(currentProgress);
        
        const isLastImage = i === selectedImages.length - 1;
        const isSingleImage = selectedImages.length === 1;
        
        try {
          // Chỉ hiện thông báo đang xử lý nếu còn nhiều ảnh
          if (!isSingleImage) {
            toast.info(`Đang xử lý ảnh ${i + 1}/${selectedImages.length}...`);
          }
          
          // Xử lý từng ảnh một
          const result = await plateService.uploadPlate(file);
          
          if (result.success && result.data.length > 0) {
            const item = result.data[0];
            
            // Kiểm tra nếu ảnh không được xử lý đúng
            const hasError = !item.plate_number || !item.crop_image_url;
            
            const processedImage: ProcessedImage = {
              id: Date.now().toString() + i,
              originalImage: item.image_url,
              croppedImage: item.crop_image_url,
              licensePlate: item.plate_number,
              processingSpeed: item.process_time,
              detectionTime: item.detected_at ? new Date(item.detected_at).toLocaleString() : "N/A",
              timestamp: new Date(item.detected_at).getTime() || Date.now(),
              hasError: hasError,
              errorMessage: hasError 
                ? (isLastImage || isSingleImage) 
                  ? "Không xử lý được ảnh" 
                  : "Không xử lý được ảnh, chuyển qua ảnh kế tiếp"
                : undefined
            };
            
            onImageProcessed(processedImage);
            
            if (hasError) {
              // Thông báo lỗi phù hợp với trường hợp ảnh cuối hoặc chỉ có 1 ảnh
              if (isLastImage || isSingleImage) {
                toast.error(`Ảnh không xử lý được`);
              } else {
                toast.error(`Ảnh ${i + 1}/${selectedImages.length} không xử lý được, chuyển qua ảnh kế tiếp.`);
              }
            } else {
              // Hiển thị thông báo thành công kèm biển số
              toast(
                `Xử lý ảnh thành công!`,
                {
                  description: item.plate_number ? `Đã nhận diện biển số: ${item.plate_number}` : undefined,
                  icon: "✅"
                }
              );
            }
          } else {
            // API trả về lỗi hoặc không có dữ liệu
            const processedImage: ProcessedImage = {
              id: Date.now().toString() + i,
              originalImage: URL.createObjectURL(file), // Dùng URL local vì không có URL từ server
              croppedImage: undefined,
              licensePlate: undefined,
              processingSpeed: undefined,
              detectionTime: new Date().toLocaleString(),
              timestamp: Date.now(),
              hasError: true,
              errorMessage: (isLastImage || isSingleImage) 
                ? "Không xử lý được ảnh" 
                : "Không xử lý được ảnh, chuyển qua ảnh kế tiếp"
            };
            
            onImageProcessed(processedImage);
            
            // Thông báo lỗi phù hợp với trường hợp ảnh cuối hoặc chỉ có 1 ảnh
            if (isLastImage || isSingleImage) {
              toast.error(`Ảnh không xử lý được`);
            } else {
              toast.error(`Ảnh ${i + 1}/${selectedImages.length} không xử lý được, chuyển qua ảnh kế tiếp.`);
            }
          }
        } catch (error) {
          console.error(`Error processing image ${i + 1}:`, error);
          
          // Vẫn tạo kết quả với thông báo lỗi
          const processedImage: ProcessedImage = {
            id: Date.now().toString() + i,
            originalImage: URL.createObjectURL(file), // Dùng URL local vì không có URL từ server
            croppedImage: undefined,
            licensePlate: undefined,
            processingSpeed: undefined,
            detectionTime: new Date().toLocaleString(),
            timestamp: Date.now(),
            hasError: true,
            errorMessage: (isLastImage || isSingleImage) 
              ? "Không xử lý được ảnh" 
              : "Không xử lý được ảnh, chuyển qua ảnh kế tiếp"
          };
          
          onImageProcessed(processedImage);
          
          // Thông báo lỗi phù hợp với trường hợp ảnh cuối hoặc chỉ có 1 ảnh
          if (isLastImage || isSingleImage) {
            toast.error(`Ảnh không xử lý được`);
          } else {
            toast.error(`Ảnh ${i + 1}/${selectedImages.length} không xử lý được, chuyển qua ảnh kế tiếp.`);
          }
        }
        
        // Nếu chưa phải ảnh cuối cùng thì chờ 1s
        if (!isLastImage) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Chỉ hiển thị thông báo tổng kết nếu có nhiều hơn 1 ảnh
      if (selectedImages.length > 1) {
        toast.success(`Đã xử lý xong tất cả ${selectedImages.length} ảnh!`);
      }
    } catch (error) {
      console.error("Error in overall image processing:", error);
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
