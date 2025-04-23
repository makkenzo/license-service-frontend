'use client';

import React, { useEffect, useState } from 'react';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { createLicense } from '@/services/license-service';
import { CreateLicenseRequest } from '@/types';

import { Textarea } from '../ui/textarea';

const createLicenseSchema = z.object({
    type: z.string().min(1, 'License type is required'),
    product_name: z.string().min(1, 'Product name is required'),
    customer_name: z.string().optional(),
    customer_email: z.string().email('Invalid email address').optional().or(z.literal('')),
    metadata: z
        .string()
        .optional()
        .refine(
            (val) => {
                if (!val) return true;
                try {
                    JSON.parse(val);
                    return true;
                } catch (e) {
                    return false;
                }
            },
            { message: 'Metadata must be valid JSON or empty' }
        ),
    expires_at: z.date().optional(),
});

type CreateLicenseFormValues = z.infer<typeof createLicenseSchema>;

interface CreateLicenseDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSuccess?: () => void;
}

export function CreateLicenseDialog({ isOpen, onOpenChange, onSuccess }: CreateLicenseDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<CreateLicenseFormValues>({
        resolver: zodResolver(createLicenseSchema),
        defaultValues: {
            type: '',
            product_name: '',
            customer_name: '',
            customer_email: '',
            metadata: '',
            expires_at: undefined,
        },
    });

    useEffect(() => {
        if (!isOpen) {
            form.reset();
            setIsLoading(false);
        }
    }, [isOpen, form]);

    const onSubmit = async (data: CreateLicenseFormValues) => {
        setIsLoading(true);
        try {
            const apiData: CreateLicenseRequest = {
                type: data.type,
                product_name: data.product_name,
                customer_name: data.customer_name || null,
                customer_email: data.customer_email || null,

                metadata: data.metadata ? JSON.parse(data.metadata) : null,

                expires_at: data.expires_at ? data.expires_at.toISOString() : null,
            };

            await createLicense(apiData);
            toast.success('License created successfully!');
            onOpenChange(false);
            onSuccess?.();
        } catch (error: any) {
            console.error('Failed to create license:', error);
            toast.error(error.message || 'Failed to create license.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[525px]">
                {' '}
                <DialogHeader>
                    <DialogTitle>Create New License</DialogTitle>
                    <DialogDescription>
                        Fill in the details for the new license. Click save when done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} id="create-license-form">
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">
                                Type *
                            </Label>

                            <Input id="type" className="col-span-3" {...form.register('type')} disabled={isLoading} />
                            {form.formState.errors.type && (
                                <p className="col-span-4 text-xs text-red-600 text-right">
                                    {form.formState.errors.type.message}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="product_name" className="text-right">
                                Product *
                            </Label>
                            <Input
                                id="product_name"
                                className="col-span-3"
                                {...form.register('product_name')}
                                disabled={isLoading}
                            />
                            {form.formState.errors.product_name && (
                                <p className="col-span-4 text-xs text-red-600 text-right">
                                    {form.formState.errors.product_name.message}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="customer_name" className="text-right">
                                Customer Name
                            </Label>
                            <Input
                                id="customer_name"
                                className="col-span-3"
                                {...form.register('customer_name')}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="customer_email" className="text-right">
                                Customer Email
                            </Label>
                            <Input
                                id="customer_email"
                                type="email"
                                className="col-span-3"
                                {...form.register('customer_email')}
                                disabled={isLoading}
                            />
                            {form.formState.errors.customer_email && (
                                <p className="col-span-4 text-xs text-red-600 text-right">
                                    {form.formState.errors.customer_email.message}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-4 items-start gap-4">
                            {' '}
                            <Label htmlFor="metadata" className="text-right pt-2">
                                Metadata (JSON)
                            </Label>
                            <Textarea
                                id="metadata"
                                placeholder='e.g., {"feature_limit": 10, "region": "eu"}'
                                className="col-span-3 min-h-[80px]"
                                {...form.register('metadata')}
                                disabled={isLoading}
                            />
                            {form.formState.errors.metadata && (
                                <p className="col-span-4 text-xs text-red-600 text-right">
                                    {form.formState.errors.metadata.message}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="expires_at" className="text-right">
                                Expires At
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={'outline'}
                                        className={cn(
                                            'col-span-3 justify-start text-left font-normal',
                                            !form.watch('expires_at') && 'text-muted-foreground'
                                        )}
                                        disabled={isLoading}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {form.watch('expires_at') ? (
                                            format(form.watch('expires_at')!, 'PPP')
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={form.watch('expires_at')}
                                        onSelect={(date) => form.setValue('expires_at', date, { shouldValidate: true })}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </form>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={isLoading}>
                            Cancel
                        </Button>
                    </DialogClose>

                    <Button type="submit" form="create-license-form" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save License'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
