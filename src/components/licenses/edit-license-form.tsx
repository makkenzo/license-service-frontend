'use client';

import React, { useEffect, useState } from 'react';

import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { updateLicense } from '@/services/license-service';
import { LicenseResponse, UpdateLicenseRequest } from '@/types';

const editLicenseSchema = z.object({
    type: z.string().optional(),
    product_name: z.string().optional(),
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
    expires_at: z.date().nullable().optional(),
});

type EditLicenseFormValues = z.infer<typeof editLicenseSchema>;

interface EditLicenseFormProps {
    license: LicenseResponse;
    onSubmitSuccess: () => void;
    onCancel: () => void;
}

export function EditLicenseForm({ license, onSubmitSuccess, onCancel }: EditLicenseFormProps) {
    const [isLoading, setIsLoading] = useState(false);

    const parseDate = (dateString: string | null | undefined): Date | undefined => {
        if (!dateString) return undefined;
        try {
            return parseISO(dateString);
        } catch {
            return undefined;
        }
    };

    const form = useForm<EditLicenseFormValues>({
        resolver: zodResolver(editLicenseSchema),

        defaultValues: {
            type: license.type || '',
            product_name: license.product_name || '',
            customer_name: license.customer_name || '',
            customer_email: license.customer_email || '',

            metadata: license.metadata ? JSON.stringify(license.metadata, null, 2) : '',
            expires_at: parseDate(license.expires_at),
        },
    });

    useEffect(() => {
        form.reset({
            type: license.type || '',
            product_name: license.product_name || '',
            customer_name: license.customer_name || '',
            customer_email: license.customer_email || '',
            metadata: license.metadata ? JSON.stringify(license.metadata, null, 2) : '',
            expires_at: parseDate(license.expires_at),
        });
    }, [license, form]);

    const onSubmit = async (data: EditLicenseFormValues) => {
        setIsLoading(true);
        try {
            const changedData: UpdateLicenseRequest = {};
            let hasChanges = false;

            if (data.type !== undefined && data.type !== license.type) {
                changedData.type = data.type;
                hasChanges = true;
            }
            if (data.product_name !== undefined && data.product_name !== license.product_name) {
                changedData.product_name = data.product_name;
                hasChanges = true;
            }

            const customerName = data.customer_name || null;
            if (customerName !== license.customer_name) {
                changedData.customer_name = customerName;
                hasChanges = true;
            }
            const customerEmail = data.customer_email || null;
            if (customerEmail !== license.customer_email) {
                changedData.customer_email = customerEmail;
                hasChanges = true;
            }

            const expiresAtDate = data.expires_at;
            const currentExpiresAtDate = parseDate(license.expires_at);
            let expiresAtISO: string | null = null;
            if (expiresAtDate) {
                expiresAtISO = expiresAtDate.toISOString();
            }

            if (expiresAtISO !== (currentExpiresAtDate ? currentExpiresAtDate.toISOString() : null)) {
                changedData.expires_at = expiresAtISO;
                hasChanges = true;
            }

            const currentMetaString = license.metadata ? JSON.stringify(license.metadata) : 'null';
            let newMetaString = 'null';
            let newMetaData = null;
            if (data.metadata) {
                try {
                    newMetaData = JSON.parse(data.metadata);
                    newMetaString = JSON.stringify(newMetaData);
                } catch (e) {
                    console.error('Invalid JSON in metadata during submit');
                }
            }
            if (newMetaString !== currentMetaString) {
                changedData.metadata = newMetaData;
                hasChanges = true;
            }

            if (!hasChanges) {
                toast.info('No changes detected.');
                onSubmitSuccess();
                return;
            }

            await updateLicense(license.id, changedData);
            toast.success('License updated successfully!');
            onSubmitSuccess();
        } catch (error: any) {
            console.error('Failed to update license:', error);
            toast.error(error.message || 'Failed to update license.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} id="edit-license-form">
            <div className="grid gap-4 py-4">
                {/* Type */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-type" className="text-right">
                        Type
                    </Label>
                    <Input id="edit-type" className="col-span-3" {...form.register('type')} disabled={isLoading} />
                    {/* Сообщения об ошибках не обязательны для всех полей при редактировании */}
                </div>
                {/* Product Name */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-product_name" className="text-right">
                        Product
                    </Label>
                    <Input
                        id="edit-product_name"
                        className="col-span-3"
                        {...form.register('product_name')}
                        disabled={isLoading}
                    />
                </div>
                {/* Customer Name */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-customer_name" className="text-right">
                        Customer Name
                    </Label>
                    <Input
                        id="edit-customer_name"
                        className="col-span-3"
                        {...form.register('customer_name')}
                        disabled={isLoading}
                    />
                </div>
                {/* Customer Email */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-customer_email" className="text-right">
                        Customer Email
                    </Label>
                    <Input
                        id="edit-customer_email"
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
                {/* Metadata */}
                <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="edit-metadata" className="text-right pt-2">
                        Metadata (JSON)
                    </Label>
                    <Textarea
                        id="edit-metadata"
                        placeholder='e.g., {"feature_limit": 10}'
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
                {/* Expires At */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-expires_at" className="text-right">
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
                                    <span>Pick a date (or leave blank)</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={form.watch('expires_at') ?? undefined}
                                onSelect={(date) => form.setValue('expires_at', date ?? null, { shouldValidate: true })}
                                // initialFocus
                            />
                            <div className="p-2 border-t border-border">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-center"
                                    onClick={() => form.setValue('expires_at', null)}
                                >
                                    Clear Date
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </form>
    );
}
