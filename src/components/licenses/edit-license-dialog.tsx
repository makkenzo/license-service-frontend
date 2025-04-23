'use client';

import React from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { LicenseResponse } from '@/types';

import { EditLicenseForm } from './edit-license-form';

interface EditLicenseDialogProps {
    license: LicenseResponse | null;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSuccess?: () => void;
}

export function EditLicenseDialog({ license, isOpen, onOpenChange, onSuccess }: EditLicenseDialogProps) {
    if (!license) {
        return null;
    }

    const handleSuccess = () => {
        onOpenChange(false);
        onSuccess?.();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Edit License</DialogTitle>
                    <DialogDescription>
                        Update the details for license key: <span className="font-mono">{license.license_key}</span>
                    </DialogDescription>
                </DialogHeader>

                <EditLicenseForm
                    license={license}
                    onSubmitSuccess={handleSuccess}
                    onCancel={() => onOpenChange(false)}
                />

                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                    </DialogClose>

                    <Button type="submit" form="edit-license-form">
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
