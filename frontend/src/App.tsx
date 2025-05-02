import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ImageUploadSection } from "@/components/ImageUploadSection";
import { ResultDisplay } from "@/components/ResultDisplay";
import { LicensePlateSearch } from "@/components/LicensePlateSearch";
import type { ProcessedImage } from "@/types";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

function App() {
  const [latestResult, setLatestResult] = useState<ProcessedImage | null>(null);
  const { toast } = useToast();

  const handleImageProcessed = (result: ProcessedImage) => {
    setLatestResult(result);
    toast({
      title: "Xử lý ảnh thành công!",
      description: `Đã nhận diện biển số: ${result.licensePlate}`,
    });
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6">Hệ thống nhận diện biển số xe</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Tải lên ảnh</h2>
          <ImageUploadSection onImageProcessed={handleImageProcessed} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Kết quả</h2>
          <ResultDisplay result={latestResult} />
        </div>
      </div>

      <Separator className="my-8" />

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="search">Tìm kiếm biển số xe</TabsTrigger>
          <TabsTrigger value="history">Lịch sử nhận diện</TabsTrigger>
        </TabsList>
        <TabsContent value="search" className="space-y-4">
          <LicensePlateSearch />
        </TabsContent>
        <TabsContent value="history" className="space-y-4">
          <LicensePlateSearch />
        </TabsContent>
      </Tabs>

      <Toaster />
    </div>
  );
}

export default App;
