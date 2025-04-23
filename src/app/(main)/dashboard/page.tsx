'use client';

import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';

import { BarChartCard } from '@/components/dashboard/bar-chart-card';
import { PieChartCard } from '@/components/dashboard/pie-chart-card';
import ErrorDisplay from '@/components/error-display';
import LoadingSpinner from '@/components/loading-spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboardSummary } from '@/services/dashboard-service';
import { BarChartDataPoint, PieChartDataPoint } from '@/types';

const DashboardPage = () => {
    const { data, error, isLoading, isError } = useQuery({
        queryKey: ['dashboardSummary'],
        queryFn: getDashboardSummary,
        staleTime: 1000 * 60 * 1,
    });

    const statusChartData = useMemo(() => {
        if (!data?.statusCounts) return [];
        return Object.entries(data.statusCounts).map(([name, value]) => ({ name, value }));
    }, [data?.statusCounts]);

    const typeChartData = useMemo(() => {
        if (!data?.typeCounts) return [];
        return Object.entries(data.typeCounts).map(([name, value]) => ({ name, value }));
    }, [data?.typeCounts]);

    const productChartData = useMemo(() => {
        if (!data?.productCounts) return [];
        return Object.entries(data.productCounts).map(([name, count]) => ({ name, count }));
    }, [data?.productCounts]);

    if (isLoading && !data) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="h-[126px] animate-pulse bg-muted"></Card>
                    ))}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="h-[380px] animate-pulse bg-muted"></Card>
                    <Card className="h-[380px] animate-pulse bg-muted"></Card>
                </div>
            </div>
        );
    }

    if (isError) {
        return <ErrorDisplay message={error?.message || 'An unknown error occurred.'} />;
    }

    const summary = data || {
        totalLicenses: 0,
        statusCounts: {},
        typeCounts: {},
        expiringSoon: { count: 0, periodDays: 30 },
        productCounts: {},
    };

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
            <h1 className="text-3xl font-bold">Dashboard</h1>

            {/* Статистика KPI карточками */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Licenses</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.totalLicenses}</div>
                        <p className="text-xs text-muted-foreground">Total registered licenses</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Licenses</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.statusCounts['active'] || 0}</div>
                        <p className="text-xs text-muted-foreground">Currently active licenses</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expired Licenses</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.statusCounts['expired'] || 0}</div>
                        <p className="text-xs text-muted-foreground">Licenses past expiration</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.expiringSoon.count}</div>
                        <p className="text-xs text-muted-foreground">
                            Expiring within {summary.expiringSoon.periodDays} days
                        </p>
                    </CardContent>
                </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <PieChartCard
                    title="Licenses by Status"
                    data={statusChartData as PieChartDataPoint[]}
                    isLoading={isLoading}
                    colors={['#22c55e', '#f97316', '#64748b', '#ef4444', '#a855f7', '#3b82f6']}
                />
                <PieChartCard
                    title="Licenses by Type"
                    data={typeChartData as PieChartDataPoint[]}
                    isLoading={isLoading}
                />
                <BarChartCard
                    title="Licenses by Product"
                    data={productChartData as BarChartDataPoint[]}
                    isLoading={isLoading}
                    barColor="#3b82f6"
                    className="col-span-2"
                />
            </div>
            {summary.expiringSoon.nextToExpire && (
                <Card>
                    <CardHeader>
                        <CardTitle>Next License to Expire</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                        <p>
                            <strong>Key:</strong> {summary.expiringSoon.nextToExpire.licenseKey}
                        </p>
                        <p>
                            <strong>Product:</strong> {summary.expiringSoon.nextToExpire.productName}
                        </p>
                        <p>
                            <strong>Expires on:</strong> {formatDate(summary.expiringSoon.nextToExpire.expiresAt)}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default DashboardPage;
