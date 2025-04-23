'use client';

import React, { useState } from 'react';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createApiKey } from '@/services/apikey-service';
import { CreateAPIKeyRequest, CreateAPIKeyResponse } from '@/types';

const schema = z.object({
    description: z.string().min(1, 'Description is required'),
});
type FormData = z.infer<typeof schema>;

interface Props {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (response: CreateAPIKeyResponse) => void;
}

export function CreateApiKeyDialog({ isOpen, onOpenChange, onSuccess }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { description: '' } });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        try {
            const apiData: CreateAPIKeyRequest = { description: data.description };

            const response = await createApiKey(apiData);
            toast.success('API Key generated successfully!');
            onSuccess(response);
            onOpenChange(false);
            form.reset();
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate API key.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Generate New API Key</DialogTitle>
                    <DialogDescription>
                        Provide a description for the new key. The key will be shown only once.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} id="create-apikey-form">
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description *
                            </Label>
                            <Input
                                id="description"
                                className="col-span-3"
                                {...form.register('description')}
                                disabled={isLoading}
                            />
                            {form.formState.errors.description && (
                                <p className="col-start-2 col-span-3 text-xs text-red-600">
                                    {form.formState.errors.description.message}
                                </p>
                            )}
                        </div>
                    </div>
                </form>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isLoading}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button type="submit" form="create-apikey-form" disabled={isLoading}>
                        {isLoading ? 'Generating...' : 'Generate Key'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
