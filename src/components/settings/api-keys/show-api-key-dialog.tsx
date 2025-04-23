'use client';

import React from 'react';

import { Copy } from 'lucide-react';
import { Terminal } from 'lucide-react';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface Props {
    apiKeyData: { id: string; full_key: string; prefix: string; description: string } | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ShowApiKeyDialog({ apiKeyData, isOpen, onOpenChange }: Props) {
    const copyToClipboard = () => {
        if (apiKeyData?.full_key) {
            navigator.clipboard.writeText(apiKeyData.full_key);
            toast.success('API Key copied to clipboard!');
        }
    };

    if (!apiKeyData) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>API Key Generated</DialogTitle>
                    <DialogDescription>
                        Your new API key has been generated. Please copy and store it securely.
                        <strong className="font-bold"> You will not be able to see this key again.</strong>
                    </DialogDescription>
                </DialogHeader>
                <Alert variant="destructive" className="mt-4">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Important Security Notice</AlertTitle>
                    <AlertDescription>
                        Treat this API key like a password. Do not share it or commit it to version control.
                    </AlertDescription>
                </Alert>
                <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">
                        Key for: <span className="text-muted-foreground">{apiKeyData.description}</span>
                    </p>
                    <p className="text-sm font-medium">
                        Prefix: <span className="font-mono text-muted-foreground">{apiKeyData.prefix}</span>
                    </p>
                    <div className="flex w-full items-center space-x-2">
                        <Input id="apiKey" value={apiKeyData.full_key} readOnly className="flex-1 font-mono" />
                        <Button type="button" size="sm" onClick={copyToClipboard}>
                            <span className="sr-only">Copy</span>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <DialogClose asChild>
                        <Button>Close</Button>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    );
}
