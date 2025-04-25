import { decodeJwt } from 'jose';
import NextAuth, { NextAuthOptions, User } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import ZitadelProvider from 'next-auth/providers/zitadel';
import { Issuer } from 'openid-client';

const getStringClaim = (claims: Record<string, unknown>, key: string): string | undefined => {
    const value = claims[key];
    return typeof value === 'string' ? value : undefined;
};

const getRolesClaim = (
    claims: Record<string, unknown>,
    key: string
): Record<string, Record<string, unknown>> | undefined => {
    const value = claims[key];
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return value as Record<string, Record<string, unknown>>;
    }
    return undefined;
};

async function refreshAccessToken(token: JWT): Promise<JWT> {
    try {
        const issuer = await Issuer.discover(process.env.ZITADEL_ISSUER ?? '');
        const client = new issuer.Client({
            client_id: process.env.ZITADEL_CLIENT_ID || '',
            token_endpoint_auth_method: 'none',
        });

        const refreshToken = token.refreshToken as string;
        if (!refreshToken) throw new Error('No refresh token available.');

        const { refresh_token, access_token, expires_at } = await client.refresh(refreshToken);

        return {
            ...token,
            accessToken: access_token,
            expiresAt: (expires_at ?? 0) * 1000,
            refreshToken: refresh_token ?? token.refreshToken,
        };
    } catch (error) {
        console.error('Error refreshing access token:', error);
        return {
            ...token,
            error: 'RefreshAccessTokenError',
        };
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        ZitadelProvider({
            issuer: process.env.ZITADEL_ISSUER,
            clientId: process.env.ZITADEL_CLIENT_ID ?? '',
            clientSecret: process.env.ZITADEL_CLIENT_SECRET ?? '',
            client: {
                token_endpoint_auth_method: 'none',
            },
            authorization: {
                params: {
                    scope: `openid email profile urn:zitadel:iam:org:project:id:${process.env.ZITADEL_PROJECT_ID}:roles offline_access`,
                },
            },
            checks: ['pkce', 'state'],
        }),
    ],
    callbacks: {
        async jwt({ token, user, account, profile, trigger }) {
            if (account?.id_token && !token.user) {
                try {
                    const idTokenClaims = decodeJwt(account.id_token);

                    const rolesClaimKey = `urn:zitadel:iam:org:project:id:${process.env.PROJECT_ID_ZITADEL}:roles`;

                    const tokenUser: User = {
                        id: getStringClaim(idTokenClaims, 'sub') ?? '',
                        name: getStringClaim(idTokenClaims, 'name'),
                        firstName: getStringClaim(idTokenClaims, 'given_name'),
                        lastName: getStringClaim(idTokenClaims, 'family_name'),
                        email: getStringClaim(idTokenClaims, 'email'),
                        loginName: getStringClaim(idTokenClaims, 'preferred_username'),
                        image: getStringClaim(idTokenClaims, 'picture'),
                        roles: getRolesClaim(idTokenClaims, rolesClaimKey),
                    };
                    token.accessToken = account.access_token;
                    token.refreshToken = account.refresh_token;
                    token.accessTokenExpires = (account.expires_at ?? 0) * 1000;
                    token.idToken = account.id_token;
                    token.error = undefined;
                } catch (e) {
                    console.error('Error decoding ID token:', e);
                    token.error = 'DecodeIDTokenError';
                }
            } else if (account) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token ?? token.refreshToken;
                token.accessTokenExpires = (account.expires_at ?? 0) * 1000;
                token.idToken = account.id_token ?? token.idToken;
            }

            if (Date.now() >= (token.accessTokenExpires as number)) {
                if (token.refreshToken) {
                    return refreshAccessToken(token);
                } else {
                    console.warn('Refresh token missing, cannot refresh.');

                    token.error = 'MissingRefreshTokenError';
                }
            }

            return token;
        },
        async session({ session, token }) {
            session.user = token.user as any;
            session.accessToken = token.accessToken as string;
            session.idToken = token.idToken as string;
            session.error = token.error as string | undefined;

            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
