'use client';

import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';
import {
    Activity,
    AlertCircle,
    AlertTriangle,
    CalendarDays,
    CheckCircle,
    Clock,
    FileText,
    Package,
    Type,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts';

import ErrorDisplay from '@/components/error-display';
import LoadingSpinner from '@/components/loading-spinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { getDashboardSummary } from '@/services/dashboard-service';

interface ChartDataPoint {
    name: string;
    value: number;
}

interface NextToExpireInfo {
    licenseKey: string;
    expiresAt: string;
    productName: string;
}

const DashboardPage = () => {
    const { data, error, isLoading, isError } = useQuery({
        queryKey: ['dashboardSummary'],
        queryFn: getDashboardSummary,
    });

    const statusChartData = useMemo(() => {
        if (!data?.statusCounts) return [];
        return Object.entries(data.statusCounts).map(([name, value]) => ({
            name: name,
            label: name.charAt(0).toUpperCase() + name.slice(1),
            value: value,
        }));
    }, [data?.statusCounts]);

    const typeChartData = useMemo(() => {
        if (!data?.typeCounts) return [];
        return Object.entries(data.typeCounts).map(([name, value]) => ({
            name: name,
            label: name,
            value: value,
        }));
    }, [data?.typeCounts]);

    const productChartData = useMemo(() => {
        if (!data?.productCounts) return [];
        return Object.entries(data.productCounts).map(([name, count]) => ({
            name: name,
            label: name,
            value: count,
        }));
    }, [data?.productCounts]);

    const statusChartConfig = useMemo(() => {
        const config: ChartConfig = {};
        statusChartData.forEach((item, index) => {
            config[item.name] = {
                label: item.label,
                color: `var(--chart-${(index % 5) + 1})`,
            };
        });
        return config;
    }, [statusChartData]);

    const typeChartConfig = useMemo(() => {
        const config: ChartConfig = {};
        typeChartData.forEach((item, index) => {
            config[item.name] = {
                label: item.label,
                color: `var(--chart-${(index % 5) + 1})`,
            };
        });
        return config;
    }, [typeChartData]);

    const productChartConfig = useMemo(() => {
        const config: ChartConfig = {};
        productChartData.forEach((item, index) => {
            config[item.name] = {
                label: item.label,
                color: `var(--chart-${(index % 5) + 1})`,
            };
        });
        return config;
    }, [productChartData]);

    if (isLoading && !data) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="h-[126px] animate-pulse bg-muted/50" />
                    ))}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="h-[380px] animate-pulse bg-muted/50" />
                    <Card className="h-[380px] animate-pulse bg-muted/50" />
                </div>
                <div className="grid gap-4">
                    <Card className="h-[150px] animate-pulse bg-muted/50" />
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
        expiringSoon: { count: 0, periodDays: 30, nextToExpire: undefined as NextToExpireInfo | undefined },
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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Licenses</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.totalLicenses}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Licenses</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.statusCounts['active'] || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expired Licenses</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.statusCounts['expired'] || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.expiringSoon.count}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-muted-foreground" /> License Status Distribution
                        </CardTitle>
                        <CardDescription>Overview of license states</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {statusChartData.length > 0 ? (
                            <ChartContainer config={statusChartConfig} className="mx-auto aspect-square h-[250px]">
                                <PieChart>
                                    <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                                    <Pie data={statusChartData} dataKey="value" nameKey="name" innerRadius={60}>
                                        {statusChartData.map((entry) => (
                                            <Cell key={`cell-${entry.name}`} fill={`var(--color-${entry.name})`} />
                                        ))}
                                    </Pie>
                                    <ChartLegend
                                        content={<ChartLegendContent nameKey="name" />}
                                        verticalAlign="bottom"
                                        height={40}
                                    />
                                </PieChart>
                            </ChartContainer>
                        ) : (
                            <div className="flex justify-center items-center h-[250px] text-muted-foreground">
                                No status data.
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Type className="h-5 w-5 text-muted-foreground" /> License Type Distribution
                        </CardTitle>
                        <CardDescription>Breakdown by license type</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {typeChartData.length > 0 ? (
                            <ChartContainer config={typeChartConfig} className="mx-auto aspect-square h-[250px]">
                                <PieChart>
                                    <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
                                    <Pie data={typeChartData} dataKey="value" nameKey="name" innerRadius={60}>
                                        {typeChartData.map((entry) => (
                                            <Cell key={`cell-${entry.name}`} fill={`var(--color-${entry.name})`} />
                                        ))}
                                    </Pie>
                                    <ChartLegend
                                        content={<ChartLegendContent nameKey="label" />}
                                        verticalAlign="bottom"
                                        height={40}
                                    />
                                </PieChart>
                            </ChartContainer>
                        ) : (
                            <div className="flex justify-center items-center h-[250px] text-muted-foreground">
                                No type data.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4">
                {' '}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-muted-foreground" /> Licenses by Product
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {productChartData.length > 0 ? (
                            <ChartContainer config={productChartConfig} className="h-[300px] w-full">
                                <BarChart
                                    accessibilityLayer
                                    data={productChartData}
                                    layout="vertical"
                                    margin={{ left: 20, top: 5, right: 5, bottom: 5 }}
                                >
                                    <CartesianGrid horizontal={false} />
                                    <YAxis
                                        dataKey="label"
                                        type="category"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={5}
                                        width={120}
                                    />
                                    <XAxis dataKey="value" type="number" hide />
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent indicator="line" nameKey="label" hideLabel />}
                                    />
                                    <Bar dataKey="value" layout="vertical" radius={4}>
                                        {productChartData.map((entry) => (
                                            <Cell key={`cell-${entry.name}`} fill={`var(--color-${entry.name})`} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        ) : (
                            <div className="flex justify-center items-center h-[300px] text-muted-foreground">
                                No product data.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {summary.expiringSoon.nextToExpire && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarDays className="h-5 w-5 text-muted-foreground" /> Next License to Expire
                        </CardTitle>
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
