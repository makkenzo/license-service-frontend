'use client';

import React from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { EllipsisIcon } from 'lucide-react';
import { toast } from 'sonner';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { revokeApiKey } from '@/services/apikey-service';
import { APIKeyResponse } from '@/types';

interface Props {
    apiKey: APIKeyResponse;
}

export function ApiKeyActions({ apiKey }: Props) {
    const queryClient = useQueryClient();
    const [isRevokeAlertOpen, setIsRevokeAlertOpen] = React.useState(false);
    const [isRevoking, setIsRevoking] = React.useState(false);

    const handleRevokeConfirm = async () => {
        setIsRevoking(true);
        try {
            await revokeApiKey(apiKey.id);
            toast.success(`API Key (${apiKey.prefix}) revoked successfully.`);
            queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
        } catch (error: any) {
            toast.error(error.message || 'Failed to revoke API key.');
        } finally {
            setIsRevoking(false);
            setIsRevokeAlertOpen(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <EllipsisIcon className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(apiKey.prefix)}>
                        Copy Prefix
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => setIsRevokeAlertOpen(true)}
                        disabled={!apiKey.is_enabled || isRevoking}
                    >
                        Revoke Key
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Диалог подтверждения */}
            <AlertDialog open={isRevokeAlertOpen} onOpenChange={setIsRevokeAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Revoking API key with prefix <span className="font-mono">{apiKey.prefix}</span> will prevent
                            any application using it from authenticating. This action cannot be easily undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isRevoking}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRevokeConfirm}
                            disabled={isRevoking}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {isRevoking ? 'Revoking...' : 'Yes, revoke key'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
