/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/apiClient.ts
import type {
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    InternalAxiosRequestConfig
} from 'axios';
import axios from 'axios';
import { toast } from 'react-toastify';

// Define API base URL
const BASE_URL = import.meta.env.VITE_API_URL || 'https://833a-150-107-232-91.ngrok-free.app/api/v1';

// Create Axios instance    
const apiClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Enables sending cookies with requests
    headers: {
        'Content-Type': 'application/json', // Default content type
    },
});

// Function to dynamically set token for auth-enabled requests
const setAuthHeader = (config: AxiosRequestConfig, useAuth: boolean): AxiosRequestConfig => {
    if (useAuth) {
        const token = localStorage.getItem('token'); // Example: retrieving token
        if (token) {
            config.headers = {
                ...config.headers,
                Authorization: `Bearer ${token}`,
            };
        }
    }
    return config;
};

// Interceptors for requests
apiClient.interceptors.request.use(
    (config: AxiosRequestConfig) => {
        return config as InternalAxiosRequestConfig<any>;
    },
    (error) => Promise.reject(error)
);

// Interceptors for responses
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            console.error('Unauthorized! Redirecting to login...');
            window.location.href = '/auth'; // Redirect for unauthorized users
        }
        if (axios.isAxiosError(error)) {
            const errorMessage = error.response?.data?.message || "Something went wrong!";
            toast.error(errorMessage);
        } else {
            toast.error("An unexpected error occurred.");
        }
        return Promise.reject(error);
    }
);

// Utility function for GET requests
export const ApiGet = async <T>(url: string, config?: AxiosRequestConfig, useAuth = true): Promise<T> => {
    const finalConfig = setAuthHeader(config || {}, useAuth);
    const response = await apiClient.get<T>(url, finalConfig);
    return response.data;
};

// Utility function for POST requests with JSON data
export const ApiPost = async <T>(url: string, data: any, config?: AxiosRequestConfig, useAuth = true): Promise<T> => {
    const finalConfig = setAuthHeader(config || {}, useAuth);
    const response = await apiClient.post<T>(url, data, finalConfig);
    return response.data;
};

// Utility function for POST requests with FormData
export const ApiPostFormData = async <T>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig,
    useAuth = true
): Promise<T> => {
    const finalConfig = setAuthHeader(
        {
            ...config,
            headers: {
                ...config?.headers,
                'Content-Type': 'multipart/form-data', // Explicitly set for FormData
            },
        },
        useAuth
    );

    const response = await apiClient.post<T>(url, formData, finalConfig);
    return response.data;
};

// Utility function for PUT requests with FormData
export const ApiPutFormData = async <T>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig,
    useAuth = true
): Promise<T> => {
    const finalConfig = setAuthHeader(
        {
            ...config,
            headers: {
                ...config?.headers,
                'Content-Type': 'multipart/form-data', // Explicitly set for FormData
            },
        },
        useAuth
    );

    const response = await apiClient.put<T>(url, formData, finalConfig);
    return response.data;
};

// Utility function for PUT requests with JSON data
export const ApiPut = async <T>(url: string, data: any, config?: AxiosRequestConfig, useAuth = true): Promise<T> => {
    const finalConfig = setAuthHeader(config || {}, useAuth);
    const response = await apiClient.put<T>(url, data, finalConfig);
    return response.data;
};

// Utility function for PATCH requests with JSON data
export const ApiPatch = async <T>(url: string, data: any, config?: AxiosRequestConfig, useAuth = true): Promise<T> => {
    const finalConfig = setAuthHeader(config || {}, useAuth);
    const response = await apiClient.patch<T>(url, data, finalConfig);
    return response.data;
};

// Utility function for DELETE requests
export const ApiDelete = async <T>(url: string, config?: AxiosRequestConfig, useAuth = true): Promise<T> => {
    const finalConfig = setAuthHeader(config || {}, useAuth);
    const response = await apiClient.delete<T>(url, finalConfig);
    return response.data;
};

export default apiClient;