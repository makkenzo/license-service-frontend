import axios, { InternalAxiosRequestConfig } from 'axios';
import { getSession, signOut } from 'next-auth/react';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const session = await getSession();
        const token = session?.accessToken;

        if (token && typeof token === 'string') {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn('Axios Interceptor: No valid access token found in session for request to', config.url);
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
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            console.error(`Unauthorized access - 401 for URL: ${originalRequest.url}. Logging out.`);

            await signOut({ redirect: false });

            if (typeof window !== 'undefined') {
                console.warn('Session expired or invalid. User logged out.');
            }

            return Promise.reject(new Error('Session expired or invalid'));
        }

        return Promise.reject(error);
    }
);

export default apiClient;
