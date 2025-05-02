import type React from "react";
import { useState } from "react";
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
import { searchByLicensePlate, getAllProcessedImages } from "@/services/imageService";
import type { ProcessedImage } from "@/types";

export function LicensePlateSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProcessedImage[]>([]);
  const [viewMode, setViewMode] = useState<"search" | "all">("all");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = searchByLicensePlate(searchQuery);
      setSearchResults(results);
      setViewMode("search");
    }
  };

  const handleViewAll = () => {
    setViewMode("all");
    setSearchQuery("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Lấy dữ liệu hiển thị dựa trên chế độ xem
  const displayData = viewMode === "search"
    ? searchResults
    : getAllProcessedImages();

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
          <Button onClick={handleSearch}>Tìm kiếm</Button>
          <Button variant="outline" onClick={handleViewAll}>
            Xem tất cả
          </Button>
        </div>

        {displayData.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Ảnh biển số</TableHead>
                  <TableHead>Biển số xe</TableHead>
                  <TableHead>Thời gian nhận diện</TableHead>
                  <TableHead className="text-right">Tốc độ xử lý</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.map((item) => (
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
                    <TableCell className="text-right">
                      {item.processingSpeed ? `${item.processingSpeed} ms` : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            {viewMode === "search"
              ? "Không tìm thấy kết quả nào cho biển số này."
              : "Chưa có biển số xe nào được xử lý. Vui lòng tải lên và xử lý ảnh."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
