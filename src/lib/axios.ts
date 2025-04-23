import axios, { InternalAxiosRequestConfig } from 'axios';

import { useAuthStore } from '@/store/auth-store';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            console.error('Unauthorized access - 401');

            useAuthStore.getState().clearAuth();

            if (typeof window !== 'undefined') {
                console.warn('Redirect to login should be handled by UI components/hooks');
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
