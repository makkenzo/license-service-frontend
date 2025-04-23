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
