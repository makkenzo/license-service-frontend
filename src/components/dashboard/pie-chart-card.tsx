'use client';

import React from 'react';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChartDataPoint } from '@/types';

import ChartLoader from '../chart-loader';

interface PieChartCardProps {
    title: string;
    description?: string;
    data: PieChartDataPoint[];
    colors?: string[];
    isLoading?: boolean;
}

const DEFAULT_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function PieChartCard({
    title,
    description,
    data,
    colors = DEFAULT_COLORS,
    isLoading = false,
}: PieChartCardProps) {
    const hasData = data && data.length > 0 && data.some((item) => item.value > 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div style={{ width: '100%', height: 300 }}>
                    {isLoading ? (
                        <ChartLoader />
                    ) : hasData ? (
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => [`${value}`, 'Count']} /> <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex justify-center items-center h-64 text-muted-foreground">
                            No data available to display.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
