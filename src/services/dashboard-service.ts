import apiClient from '@/lib/axios';

export const getDashboardSummary = async (): Promise<DashboardSummaryResponse> => {
    try {
        const response = await apiClient.get<DashboardSummaryResponse>('/dashboard/summary');
        return response.data;
    } catch (error: any) {
        console.error('Get Dashboard Summary API error:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to fetch dashboard summary');
    }
};
