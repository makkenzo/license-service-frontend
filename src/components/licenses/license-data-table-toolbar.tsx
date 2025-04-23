'use client';

import React, { useEffect, useState } from 'react';

import { Table } from '@tanstack/react-table';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ListLicenseParams } from '@/types';

const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'expired', label: 'Expired' },
    { value: 'revoked', label: 'Revoked' },
];

interface LicenseDataTableToolbarProps<TData> {
    table: Table<TData>;

    onFilterChange: (filters: Partial<ListLicenseParams>) => void;

    currentFilters: Partial<ListLicenseParams>;
}

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

export function LicenseDataTableToolbar<TData>({
    table,
    onFilterChange,
    currentFilters,
}: LicenseDataTableToolbarProps<TData>) {
    const [emailFilterInput, setEmailFilterInput] = useState(currentFilters.email || '');

    const debouncedEmailFilter = useDebounce(emailFilterInput, 500);

    const isFiltered = !!currentFilters.email || !!currentFilters.status;

    useEffect(() => {
        onFilterChange({ ...currentFilters, email: debouncedEmailFilter || undefined });

        table.setPageIndex(0);
    }, [debouncedEmailFilter]);

    const handleStatusChange = (value: string) => {
        const newStatus = value === 'all' ? undefined : value;
        onFilterChange({ ...currentFilters, status: newStatus });

        table.setPageIndex(0);
    };

    const handleEmailInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmailFilterInput(event.target.value);
    };

    const clearFilters = () => {
        setEmailFilterInput('');
        onFilterChange({});
        table.setPageIndex(0);
    };

    return (
        <div className="flex items-center justify-between py-4">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Filter by customer email..."
                    value={emailFilterInput}
                    onChange={handleEmailInputChange}
                    className="h-8 w-[150px] lg:w-[250px]"
                />

                <Select value={currentFilters.status || 'all'} onValueChange={handleStatusChange}>
                    <SelectTrigger className="h-8 w-[180px]">
                        <SelectValue placeholder="Filter by status..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {statuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                                {status.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {isFiltered && (
                    <Button variant="ghost" onClick={clearFilters} className="h-8 px-2 lg:px-3">
                        Reset
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
