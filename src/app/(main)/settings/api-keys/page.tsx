'use client';

import { useState } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ColumnDef, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { format } from 'date-fns';
import { CheckCircle, XCircle } from 'lucide-react';

import { ApiKeyActions } from '@/components/settings/api-keys/api-key-actions';
import { ApiKeyDataTable } from '@/components/settings/api-keys/api-key-data-table';
import { CreateApiKeyDialog } from '@/components/settings/api-keys/create-api-key-dialog';
import { ShowApiKeyDialog } from '@/components/settings/api-keys/show-api-key-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getApiKeys } from '@/services/apikey-service';
import { APIKeyResponse, CreateAPIKeyResponse } from '@/types';

interface ApiKeysPageProps {}

const columns: ColumnDef<APIKeyResponse>[] = [
    {
        accessorKey: 'prefix',
        header: 'Prefix',
        cell: ({ row }) => <span className="font-mono">{row.getValue('prefix')}</span>,
    },
    { accessorKey: 'description', header: 'Description' },
    {
        accessorKey: 'is_enabled',
        header: 'Status',
        cell: ({ row }) => {
            const isEnabled = row.getValue('is_enabled');
            return isEnabled ? (
                <Badge variant="default">
                    <CheckCircle className="h-3 w-3 mr-1" /> Enabled
                </Badge>
            ) : (
                <Badge variant="destructive">
                    <XCircle className="h-3 w-3 mr-1" /> Revoked
                </Badge>
            );
        },
    },
    {
        accessorKey: 'created_at',
        header: 'Created At',
        cell: ({ row }) => format(new Date(row.getValue('created_at')), 'PPP p'), // Форматируем дату и время
    },
    {
        accessorKey: 'last_used_at',
        header: 'Last Used',
        cell: ({ row }) => {
            const lastUsed = row.getValue('last_used_at') as string | null;
            return lastUsed ? format(new Date(lastUsed), 'PPP p') : 'Never';
        },
    },
    { id: 'actions', cell: ({ row }) => <ApiKeyActions apiKey={row.original} /> },
];

const ApiKeysPage = ({}: ApiKeysPageProps) => {
    const queryClient = useQueryClient();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [showKeyData, setShowKeyData] = useState<CreateAPIKeyResponse | null>(null);

    const {
        data: apiKeys = [],
        error,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['apiKeys'],
        queryFn: getApiKeys,
        staleTime: 1000 * 60 * 5, // Кэш на 5 минут
    });

    const table = useReactTable({
        data: apiKeys,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const handleKeyCreated = (response: CreateAPIKeyResponse) => {
        setShowKeyData(response);
        queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
    };

    return (
        <div className="container mx-auto py-6 space-y-4">
            <div className="flex items-center justify-between space-x-2">
                <h1 className="text-3xl font-bold">API Keys</h1>
                <Button onClick={() => setIsCreateDialogOpen(true)}>Generate New Key</Button>
            </div>
            <p className="text-muted-foreground text-sm">
                API keys are used by agents or external applications to authenticate with the validation endpoint.
            </p>

            {isError && <p className="text-red-600">Error loading API keys: {error?.message}</p>}

            <ApiKeyDataTable columns={columns} table={table} isLoading={isLoading} />

            <CreateApiKeyDialog
                isOpen={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSuccess={handleKeyCreated}
            />

            <ShowApiKeyDialog
                apiKeyData={showKeyData}
                isOpen={!!showKeyData}
                onOpenChange={(open) => {
                    if (!open) setShowKeyData(null);
                }}
            />
        </div>
    );
};

export default ApiKeysPage;
