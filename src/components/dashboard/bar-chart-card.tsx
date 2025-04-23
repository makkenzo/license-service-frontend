'use client';

import React from 'react';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChartDataPoint } from '@/types';

import ChartLoader from '../chart-loader';

interface BarChartCardProps {
    title: string;
    description?: string;
    data: BarChartDataPoint[];
    barColor?: string;
    isLoading?: boolean;
    className?: string;
}

export function BarChartCard({
    title,
    description,
    data,
    barColor = '#8884d8',
    isLoading = false,
    className,
}: BarChartCardProps) {
    const hasData = data && data.length > 0;

    return (
        <Card className={className}>
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
                            <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                {' '}
                                {/* Настраиваем отступы */}
                                <CartesianGrid strokeDasharray="3 3" vertical={false} /> {/* Сетка */}
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} /> {/* Ось X */}
                                <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />{' '}
                                {/* Ось Y */}
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    formatter={(value: number) => [`${value}`, 'Count']}
                                />{' '}
                                {/* Всплывающая подсказка */}
                                {/* <Legend /> Можно добавить легенду, если несколько столбцов */}
                                <Bar dataKey="count" fill={barColor} radius={[4, 4, 0, 0]} /> {/* Столбцы */}
                            </BarChart>
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
