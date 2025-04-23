'use client';

import { useCallback, useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { ColumnDef, PaginationState, SortingState, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

import ErrorDisplay from '@/components/error-display';
import { LicenseDataTable } from '@/components/licenses/license-data-table';
import { LicenseDataTableToolbar } from '@/components/licenses/license-data-table-toolbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getLicenses } from '@/services/license-service';
import { LicenseResponse, ListLicenseParams } from '@/types';

export const columns: ColumnDef<LicenseResponse>[] = [
    // Опционально: Колонка для выбора строк
    //   {
    //     id: 'select',
    //     header: ({ table }) => (
    //       <Checkbox
    //         checked={
    //           table.getIsAllPageRowsSelected() ||
    //           (table.getIsSomePageRowsSelected() && 'indeterminate')
    //         }
    //         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //         aria-label="Select all"
    //       />
    //     ),
    //     cell: ({ row }) => (
    //       <Checkbox
    //         checked={row.getIsSelected()}
    //         onCheckedChange={(value) => row.toggleSelected(!!value)}
    //         aria-label="Select row"
    //       />
    //     ),
    //     enableSorting: false,
    //     enableHiding: false,
    //   },
    {
        accessorKey: 'license_key',
        header: 'License Key',
        cell: ({ row }) => <div className="font-mono">{row.getValue('license_key')}</div>,
    },
    {
        accessorKey: 'status',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            let variant: 'default' | 'destructive' | 'outline' | 'secondary' = 'secondary';
            if (status === 'active') variant = 'default'; // В shadcn 'default' обычно зеленый или основной
            if (status === 'expired' || status === 'revoked') variant = 'destructive';
            if (status === 'pending' || status === 'inactive') variant = 'outline';
            return <Badge variant={variant}>{status}</Badge>;
        },
    },
    {
        accessorKey: 'type',
        header: 'Type',
    },
    {
        accessorKey: 'product_name',
        header: 'Product',
    },
    {
        accessorKey: 'customer_email',
        header: 'Customer Email',
        cell: ({ row }) => row.getValue('customer_email') || '-', // Показываем '-' если null
    },
    {
        accessorKey: 'expires_at',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Expires At
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const dateStr = row.getValue('expires_at') as string | null;
            if (!dateStr) return 'Never';
            try {
                return new Date(dateStr).toLocaleDateString();
            } catch {
                return 'Invalid Date';
            }
        },
    },
    {
        accessorKey: 'created_at',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Created At
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => new Date(row.getValue('created_at')).toLocaleDateString(),
    },
    // TODO: Добавить колонку для действий (редактировать, изменить статус и т.д.)
    //   {
    //     id: 'actions',
    //     cell: ({ row }) => {
    //       const license = row.original;
    //       // DropdownMenu с действиями
    //     },
    //   },
];

const LicensesPage = () => {
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const [sorting, setSorting] = useState<SortingState>([]);
    const [filters, setFilters] = useState<Partial<ListLicenseParams>>({});

    const queryParams = useMemo(() => {
        const params: ListLicenseParams = {
            limit: pagination.pageSize,
            offset: pagination.pageIndex * pagination.pageSize,
            ...(filters.status && { status: filters.status }),
            ...(filters.email && { email: filters.email }),
            ...(filters.product_name && { product_name: filters.product_name }),
            ...(filters.type && { type: filters.type }),
        };
        if (sorting.length > 0) {
            params.sort_by = sorting[0].id;
            params.sort_order = sorting[0].desc ? 'DESC' : 'ASC';
        }
        return params;
    }, [pagination, filters, sorting]);

    const { data, error, isLoading, isError, isFetching } = useQuery({
        queryKey: ['licenses', queryParams],
        queryFn: () => getLicenses(queryParams),
    });

    const defaultData = useMemo(() => [], []);
    const pageCount = data?.totalCount ? Math.ceil(data.totalCount / pagination.pageSize) : -1;

    const table = useReactTable({
        data: data?.licenses ?? defaultData,
        columns,
        pageCount: pageCount,
        state: {
            pagination,
            sorting,
        },
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        meta: {
            totalRowCount: data?.totalCount,
        },
        debugTable: process.env.NODE_ENV === 'development',
    });

    const handleFilterChange = useCallback((newFilters: Partial<ListLicenseParams>) => {
        setFilters((prevFilters) => {
            const updated = { ...prevFilters };

            if (newFilters.status !== undefined) updated.status = newFilters.status || undefined;
            else delete updated.status;

            if (newFilters.email !== undefined) updated.email = newFilters.email || undefined;
            else delete updated.email;

            return updated;
        });
    }, []);

    return (
        <div className="container mx-auto py-6 space-y-4">
            <h1 className="text-3xl font-bold">Manage Licenses</h1>
            <LicenseDataTableToolbar table={table} onFilterChange={handleFilterChange} currentFilters={filters} />

            {isError && <ErrorDisplay message={error?.message || 'Failed to load licenses.'} />}

            <LicenseDataTable columns={columns} table={table} isLoading={isLoading || isFetching} />
        </div>
    );
};

export default LicensesPage;
