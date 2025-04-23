import apiClient from '@/lib/axios';
import { APIKeyResponse, CreateAPIKeyRequest, CreateAPIKeyResponse } from '@/types';

export const getApiKeys = async (): Promise<APIKeyResponse[]> => {
    try {
        const response = await apiClient.get<APIKeyResponse[]>('/apikeys');
        return response.data;
    } catch (error: any) {
        console.error('Get API Keys API error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to fetch API keys');
    }
};

export const createApiKey = async (data: CreateAPIKeyRequest): Promise<CreateAPIKeyResponse> => {
    try {
        const response = await apiClient.post<CreateAPIKeyResponse>('/apikeys', data);
        return response.data;
    } catch (error: any) {
        console.error('Create API Key API error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to create API key');
    }
};

export const revokeApiKey = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/apikeys/${id}`);
    } catch (error: any) {
        console.error(`Revoke API Key API error (ID: ${id}):`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to revoke API key');
    }
};
