import { AlertCircle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function ErrorDisplay({ message }: { message: string }) {
    return (
        <Card className="bg-destructive/10 border-destructive">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" /> Error Fetching Data
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p>{message}</p>
            </CardContent>
        </Card>
    );
}
