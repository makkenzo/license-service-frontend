'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertCircle, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboardSummary } from '@/services/dashboard-service';

function LoadingSpinner() {
    return (
        <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading data...</span>
        </div>
    );
}

function ErrorDisplay({ message }: { message: string }) {
    return (
        <Card className="bg-destructive/10 border-destructive">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" /> Error Fetching Data
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p>{message}</p>
            </CardContent>
        </Card>
    );
}

const DashboardPage = () => {
    const { data, error, isLoading, isError } = useQuery({
        queryKey: ['dashboardSummary'],
        queryFn: getDashboardSummary,
    });

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (isError) {
        return <ErrorDisplay message={error?.message || 'An unknown error occurred.'} />;
    }

    const {
        totalLicenses = 0,
        statusCounts = {},
        typeCounts = {},
        expiringSoon = { count: 0, periodDays: 30 },
        productCounts = {},
    } = data || {};

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return 'Invalid Date';
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Licenses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalLicenses}</div>
                        <p className="text-xs text-muted-foreground">Total registered licenses</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Licenses</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statusCounts['active'] || 0}</div>
                        <p className="text-xs text-muted-foreground">Currently active licenses</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expired Licenses</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{statusCounts['expired'] || 0}</div>
                        <p className="text-xs text-muted-foreground">Licenses past expiration</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{expiringSoon.count}</div>
                        <p className="text-xs text-muted-foreground">Expiring within {expiringSoon.periodDays} days</p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Licenses by Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {Object.keys(typeCounts).length > 0 ? (
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                {Object.entries(typeCounts).map(([type, count]) => (
                                    <li key={type} className="flex justify-between">
                                        <span>{type}</span>
                                        <span className="font-medium">{count}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No data available.</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Licenses by Product</CardTitle>
                        <CardDescription>Distribution across different products.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {Object.keys(productCounts).length > 0 ? (
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                {Object.entries(productCounts).map(([product, count]) => (
                                    <li key={product} className="flex justify-between">
                                        <span>{product}</span>
                                        <span className="font-medium">{count}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No data available.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
            {expiringSoon.nextToExpire && (
                <Card>
                    <CardHeader>
                        <CardTitle>Next License to Expire</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                        <p>
                            <strong>Key:</strong> {expiringSoon.nextToExpire.licenseKey}
                        </p>
                        <p>
                            <strong>Product:</strong> {expiringSoon.nextToExpire.productName}
                        </p>
                        <p>
                            <strong>Expires on:</strong> {formatDate(expiringSoon.nextToExpire.expiresAt)}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default DashboardPage;
