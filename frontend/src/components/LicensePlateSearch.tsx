import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { plateService } from "@/api/plateService";
import { toast } from "sonner";
import type { ProcessedImage } from "@/types";

export function LicensePlateSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProcessedImage[]>([]);
  const [viewMode, setViewMode] = useState<"search" | "all">("all");
  const [isLoading, setIsLoading] = useState(false);
  const [deletingPlate, setDeletingPlate] = useState<string | null>(null);

  // Helper for original image
  const getOriginalImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return null;
    const filename = imageUrl.split('/').pop();
    if (!filename) return null;
    return `http://localhost:8000/api/static/original/${filename}`;
  };

  // Helper for cropped image
  const getCroppedImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return null;
    const filename = imageUrl.split('/').pop();
    if (!filename) return null;
    return `http://localhost:8000/static/cropped/${filename}`;
  };

  const fetchAllPlates = async () => {
    try {
      setIsLoading(true);
      const response = await plateService.getAllPlates(100); // Fetch up to 100 plates
      if (response.success) {
        const processedImages: ProcessedImage[] = response.data.map((item) => ({
          id: `${item.plate_number}_${item.detected_at}`,
          originalImage: getOriginalImageUrl(item.image_url) || '',
          croppedImage: getCroppedImageUrl(item.crop_image_url) || '',
          licensePlate: item.plate_number,
          processingSpeed: item.process_time,
          detectionTime: item.detected_at ? new Date(item.detected_at).toLocaleString() : "N/A",
          timestamp: new Date(item.detected_at).getTime() || Date.now(),
        }));
        setSearchResults(processedImages);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error fetching plates:", error);
      toast.error("Không thể tải danh sách biển số!");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPlates();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsLoading(true);
      const response = await plateService.findPlate({ plate_number: searchQuery });
      if (response.success) {
        const processedImages: ProcessedImage[] = response.data.map((item) => ({
          id: `${item.plate_number}_${item.detected_at}`,
          originalImage: getOriginalImageUrl(item.image_url) || '',
          croppedImage: getCroppedImageUrl(item.crop_image_url) || '',
          licensePlate: item.plate_number,
          processingSpeed: item.process_time,
          detectionTime: item.detected_at ? new Date(item.detected_at).toLocaleString() : "N/A",
          timestamp: new Date(item.detected_at).getTime() || Date.now(),
        }));
        setSearchResults(processedImages);
        setViewMode("search");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error searching plates:", error);
      toast.error("Không thể tìm kiếm biển số!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAll = () => {
    setViewMode("all");
    setSearchQuery("");
    fetchAllPlates();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleDelete = async (id: string, plateNumber: string, detectedAt: string) => {
    if (deletingPlate) return; // Prevent multiple deletions at once

    try {
      setDeletingPlate(id);
      const response = await plateService.deletePlate(plateNumber, detectedAt);
      if (response.success) {
        toast.success(response.message);
        // Chỉ xóa đúng dòng có id này
        setSearchResults(prev => prev.filter(item => item.id !== id));
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error deleting plate:", error);
      toast.error("Không thể xóa biển số!");
    } finally {
      setDeletingPlate(null);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          {viewMode === "search" ? "Kết quả tìm kiếm" : "Tất cả biển số đã xử lý"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Nhập biển số cần tìm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full"
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? "Đang tìm..." : "Tìm kiếm"}
          </Button>
          <Button variant="outline" onClick={handleViewAll} disabled={isLoading}>
            Xem tất cả
          </Button>
        </div>

        {searchResults.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Ảnh biển số</TableHead>
                  <TableHead>Biển số xe</TableHead>
                  <TableHead>Thời gian nhận diện</TableHead>
                  <TableHead>Tốc độ xử lý</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchResults.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="p-2">
                      {item.croppedImage && (
                        <div className="w-24 h-16 overflow-hidden rounded">
                          <img
                            src={item.croppedImage}
                            alt={item.licensePlate || "Unknown"}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono font-semibold">
                      {item.licensePlate || "N/A"}
                    </TableCell>
                    <TableCell>{item.detectionTime || "N/A"}</TableCell>
                    <TableCell>
                      {item.processingSpeed ? `${item.processingSpeed} ms` : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button
                          variant="destructive"
                          onClick={() => handleDelete(item.id, item.licensePlate!, item.detectionTime!)}
                          disabled={deletingPlate === item.id || !item.licensePlate || !item.detectionTime}
                        >
                          {deletingPlate === item.id ? "Đang xóa..." : "Xóa"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            {isLoading
              ? "Đang tải dữ liệu..."
              : viewMode === "search"
              ? "Không tìm thấy kết quả nào cho biển số này."
              : "Chưa có biển số xe nào được xử lý. Vui lòng tải lên và xử lý ảnh."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
