import apiClient from '@/lib/axios';
import { ListLicenseParams, PaginatedLicenseResponse } from '@/types';

export const getLicenses = async (params: ListLicenseParams): Promise<PaginatedLicenseResponse> => {
    try {
        const response = await apiClient.get<PaginatedLicenseResponse>('/licenses', { params });
        return response.data;
    } catch (error: any) {
        console.error('Get Licenses API error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to fetch licenses');
    }
};
