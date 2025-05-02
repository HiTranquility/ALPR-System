import type React from "react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import type { ProcessedImage } from "@/types";
import { processImage, addProcessedImage } from "@/services/imageService";

interface ImageUploadSectionProps {
  onImageProcessed: (result: ProcessedImage) => void;
}

export function ImageUploadSection({ onImageProcessed }: ImageUploadSectionProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const multipleFileInputRef = useRef<HTMLInputElement>(null);

  const handleSingleImageSelect = () => {
    if (singleFileInputRef.current) {
      singleFileInputRef.current.click();
    }
  };

  const handleMultipleImageSelect = () => {
    if (multipleFileInputRef.current) {
      multipleFileInputRef.current.click();
    }
  };

  const handleSingleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedImages([files[0]]);
    }
  };

  const handleMultipleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedImages(Array.from(files));
    }
  };

  const handleProcessImages = async () => {
    if (selectedImages.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    for (let i = 0; i < selectedImages.length; i++) {
      try {
        const result = await processImage(selectedImages[i]);
        addProcessedImage(result);
        onImageProcessed(result);

        // Cập nhật tiến trình
        const newProgress = Math.round(((i + 1) / selectedImages.length) * 100);
        setProgress(newProgress);
      } catch (error) {
        console.error("Error processing image:", error);
      }
    }

    setIsProcessing(false);
  };

  const clearSelectedImages = () => {
    setSelectedImages([]);
    if (singleFileInputRef.current) singleFileInputRef.current.value = "";
    if (multipleFileInputRef.current) multipleFileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleSingleImageSelect} variant="outline">
          Chèn 1 ảnh
        </Button>
        <Button onClick={handleMultipleImageSelect} variant="outline">
          Chèn nhiều ảnh
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
        ref={singleFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleSingleFileChange}
        className="hidden"
      />
      <Input
        ref={multipleFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleMultipleFileChange}
        multiple
        className="hidden"
      />

      {isProcessing && (
        <div className="space-y-2">
          <p>Đang xử lý: {progress}%</p>
          <Progress value={progress} className="h-2" />
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
