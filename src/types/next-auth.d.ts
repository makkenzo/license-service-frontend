import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
    interface User {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
        firstName?: string | null;
        lastName?: string | null;
        loginName?: string | null;
        roles?: Record<string, Record<string, unknown>> | null;
    }

    interface Session {
        user: User;
        accessToken?: string;
        idToken?: string;
        error?: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        accessToken?: string;
        refreshToken?: string;
        accessTokenExpires?: number;
        idToken?: string;
        user: {
            id: string | undefined;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            firstName?: string | null;
            lastName?: string | null;
            loginName?: string | null;
            roles?: Record<string, Record<string, unknown>> | null;
        };
        error?: string;
    }
}
