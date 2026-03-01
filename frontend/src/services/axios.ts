import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

// Create an Axios instance
const axiosInstance: AxiosInstance = axios.create({
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Generic GET request function
export const getAxios = async <Response>(
  url: string,
  params?: Record<string, any>
): Promise<Response> => {
  try {
    const response = await axiosInstance.get<Response>(url, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Generic POST with optional config (e.g., for Blob responses)
export const postAxios = async <Response, Request = any>(
  url: string,
  data: Request,
  config?: AxiosRequestConfig
): Promise<Response> => {
  try {
    const response = await axiosInstance.post<Response>(url, data, config);
    return response.data;
  } catch (error) {
    throw error;
  }
};
