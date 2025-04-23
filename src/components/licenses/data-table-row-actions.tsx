'use client';

import React from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { EllipsisIcon } from 'lucide-react';
import { toast } from 'sonner';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import apiClient from '@/lib/axios';
import { LicenseResponse } from '@/types';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../ui/alert-dialog';

const availableStatuses: { value: string; label: string }[] = [
    { value: 'active', label: 'Activate' },
    { value: 'inactive', label: 'Deactivate' },
    { value: 'revoked', label: 'Revoke' },
];

interface DataTableRowActionsProps {
    license: LicenseResponse;
}

export function DataTableRowActions({ license }: DataTableRowActionsProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isChangingStatus, setIsChangingStatus] = React.useState(false);
    const [isRevokeAlertOpen, setIsRevokeAlertOpen] = React.useState(false);

    const handleEdit = () => {
        console.log('Edit license:', license.id);
        toast.info(`Edit action triggered for license: ${license.license_key}`);
    };

    const handleChangeStatus = async (newStatus: string) => {
        if (newStatus === license.status) {
            toast.info(`License is already ${newStatus}.`);
            return;
        }
        setIsChangingStatus(true);
        try {
            await apiClient.patch(`/licenses/${license.id}/status`, { status: newStatus });
            toast.success(`License status changed to ${newStatus}`);

            queryClient.invalidateQueries({ queryKey: ['licenses'] });
        } catch (error: any) {
            console.error('Failed to change status:', error);
            toast.error(error.response?.data?.message || `Failed to change status to ${newStatus}`);
        } finally {
            setIsChangingStatus(false);
        }
    };

    const handleRevokeConfirm = async () => {
        setIsChangingStatus(true);
        setIsRevokeAlertOpen(false);
        try {
            await apiClient.patch(`/licenses/${license.id}/status`, { status: 'revoked' });
            toast.success(`License ${license.license_key} has been revoked.`);
            queryClient.invalidateQueries({ queryKey: ['licenses'] });
        } catch (error: any) {
            console.error('Failed to revoke license:', error);
            toast.error(error.response?.data?.message || `Failed to revoke license.`);
        } finally {
            setIsChangingStatus(false);
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                        disabled={isChangingStatus}
                    >
                        <EllipsisIcon className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(license.license_key)}>
                        Copy Key
                    </DropdownMenuItem>

                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>Change Status</DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <DropdownMenuGroup>
                                    {availableStatuses
                                        .filter((status) => status.value !== license.status)
                                        .map((status) => (
                                            <DropdownMenuItem
                                                key={status.value}
                                                onClick={() => handleChangeStatus(status.value)}
                                                disabled={isChangingStatus}
                                            >
                                                {status.label}
                                            </DropdownMenuItem>
                                        ))}
                                </DropdownMenuGroup>
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        onClick={() => setIsRevokeAlertOpen(true)}
                        disabled={isChangingStatus || license.status === 'revoked'}
                    >
                        Revoke License
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={isRevokeAlertOpen} onOpenChange={setIsRevokeAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action will permanently revoke the license key{' '}
                            <span className="font-mono font-semibold">{license.license_key}</span>. The agent will no
                            longer be able to validate this license. This cannot be undone easily.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isChangingStatus}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRevokeConfirm}
                            disabled={isChangingStatus}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                        >
                            {isChangingStatus ? 'Revoking...' : 'Yes, revoke license'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
