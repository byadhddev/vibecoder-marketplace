import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { createProfile, getProfileByUsername } from '@/lib/github/queries';

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            authorization: { params: { scope: 'read:user public_repo' } },
        }),
    ],
    pages: { signIn: '/login' },
    callbacks: {
        async jwt({ token, account, profile }) {
            if (account && profile) {
                token.accessToken = account.access_token;
                token.username = (profile as { login?: string }).login;

                try {
                    const ghUsername = (token.username as string).toLowerCase();
                    const existing = await getProfileByUsername(ghUsername);
                    if (!existing) {
                        const ghName = (profile as { name?: string }).name || ghUsername;
                        const ghAvatar = (profile as { avatar_url?: string }).avatar_url || '';
                        await createProfile(ghUsername, ghUsername, ghName, ghAvatar);
                    }
                } catch (e) {
                    console.error('Error syncing profile:', e);
                }
            }
            return token;
        },
        async session({ session, token }) {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: ((token.username as string) ?? token.sub ?? '').toLowerCase(),
                    username: ((token.username as string) ?? '').toLowerCase(),
                },
                accessToken: token.accessToken as string | undefined,
            };
        },
    },
});

export interface ExtendedSession {
    user: {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
        username?: string;
    };
    accessToken?: string;
    expires: string;
}
