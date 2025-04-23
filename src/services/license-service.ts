import apiClient from '@/lib/axios';
import {
    CreateLicenseRequest,
    LicenseResponse,
    ListLicenseParams,
    PaginatedLicenseResponse,
    UpdateLicenseRequest,
} from '@/types';

export const getLicenses = async (params: ListLicenseParams): Promise<PaginatedLicenseResponse> => {
    try {
        const response = await apiClient.get<PaginatedLicenseResponse>('/licenses', { params });
        return response.data;
    } catch (error: any) {
        console.error('Get Licenses API error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to fetch licenses');
    }
};

export const createLicense = async (data: CreateLicenseRequest): Promise<LicenseResponse> => {
    try {
        const response = await apiClient.post<LicenseResponse>('/licenses', data);
        return response.data;
    } catch (error: any) {
        console.error('Create License API error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to create license');
    }
};

export const updateLicense = async (id: string, data: UpdateLicenseRequest): Promise<LicenseResponse> => {
    try {
        // Используем PATCH для частичного обновления
        const response = await apiClient.patch<LicenseResponse>(`/licenses/${id}`, data);
        return response.data;
    } catch (error: any) {
        console.error(`Update License API error (ID: ${id}):`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to update license');
    }
};
