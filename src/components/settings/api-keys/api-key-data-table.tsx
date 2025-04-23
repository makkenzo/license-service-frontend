'use client';

import { ColumnDef, Table as ReactTable } from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ApiKeyDataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    table: ReactTable<TData>;
    isLoading?: boolean;
}

export function ApiKeyDataTable<TData, TValue>({
    columns,
    table,
    isLoading = false,
}: ApiKeyDataTableProps<TData, TValue>) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>{/* ... рендеринг заголовков ... */}</TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                Loading...
                            </TableCell>
                        </TableRow>
                    ) : table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No API keys found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
