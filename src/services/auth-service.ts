import apiClient from '@/lib/axios';

export const loginUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
        const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
        return response.data;
    } catch (error: any) {
        console.error('Login API error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Login failed');
    }
};
