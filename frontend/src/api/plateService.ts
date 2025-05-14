import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/plates';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface PlateResponse {
  plate_number: string;
  image_url: string;
  crop_image_url: string;
  process_time: number;
  source: string;
  detected_at: string;
}

export interface BaseResponse {
  success: boolean;
  total: number;
  message: string;
  data: PlateResponse[];
}

// API Service
export const plateService = {
  // Upload single plate image
  async uploadPlate(file: File): Promise<BaseResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<BaseResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload multiple plate images
  async uploadManyPlates(files: File[]): Promise<BaseResponse> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await api.post<BaseResponse>('/upload-many', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Find plate by number
  async findPlate(params: {
    plate_number: string;
    source?: string;
    detected_at?: string;
    left_at?: string;
  }): Promise<BaseResponse> {
    const response = await api.get<BaseResponse>('/find', { params });
    return response.data;
  },

  // Get all plates
  async getAllPlates(size: number): Promise<BaseResponse> {
    const response = await api.get<BaseResponse>('/get-all', {
      params: { size },
    })
    return response.data;
  },

  // Delete plate by number (dùng path param)
  async deletePlate(plate_number: string, detected_at: string): Promise<BaseResponse> {
    const isoDetectedAt = toISODateTime(detected_at);
    const response = await api.delete<BaseResponse>(`/delete?plate_number=${plate_number}&detected_at=${isoDetectedAt}`);
    return response.data;
  },
};

// Error handling interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors here
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error:', error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      return Promise.reject(new Error('No response received from server'));
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
      return Promise.reject(error);
    }
  }
);

function toISODateTime(display: string): string {
  // display: "20:38:15 14/5/2025"
  const [time, date] = display.split(' ');
  const [day, month, year] = date.split('/');
  // Đảm bảo luôn có 2 chữ số cho tháng và ngày
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${time}`;
}

const iso = toISODateTime("20:38:15 14/5/2025"); // Kết quả: "2025-05-14T20:38:15" 