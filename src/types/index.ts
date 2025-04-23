interface LoginRequest {
    username?: string;
    password?: string;
}

interface LoginResponse {
    access_token: string;
}

interface LicenseInfo {
    licenseKey: string;
    expiresAt: string;
    productName: string;
}

interface ExpiringSoonSummary {
    count: number;
    periodDays: number;
    nextToExpire?: LicenseInfo;
}

interface DashboardSummaryResponse {
    totalLicenses: number;
    statusCounts: { [key: string]: number };
    typeCounts: { [key: string]: number };
    expiringSoon: ExpiringSoonSummary;
    productCounts: { [key: string]: number };
}

export interface ListLicenseParams {
    status?: string;
    email?: string;
    product_name?: string;
    type?: string;
    limit?: number;
    offset?: number;
    sort_by?: string;
    sort_order?: 'ASC' | 'DESC';
}

export interface LicenseResponse {
    id: string;
    license_key: string;
    status: string;
    type: string;
    customer_name?: string | null;
    customer_email?: string | null;
    product_name: string;
    metadata?: any;
    issued_at?: string | null;
    expires_at?: string | null;
    created_at: string;
    updated_at: string;
}

export interface PaginatedLicenseResponse {
    licenses: LicenseResponse[];
    totalCount: number;
    limit: number;
    offset: number;
}

export interface CreateLicenseRequest {
    type: string;
    product_name: string;
    customer_name?: string | null;
    customer_email?: string | null;
    metadata?: any;
    expires_at?: string | null;
    initial_status?: string | null;
}

export interface UpdateLicenseRequest {
    type?: string | null;
    product_name?: string | null;
    customer_name?: string | null;
    customer_email?: string | null;
    metadata?: any | null;
    expires_at?: string | null;
}
