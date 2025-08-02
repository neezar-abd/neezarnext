import NextAuth from 'next-auth/next';
import GithubProvider from 'next-auth/providers/github';
import { backendEnv } from '@lib/env-server';
import { getGithubUsername } from '@lib/helper-server';
import type { AuthOptions, Session } from 'next-auth';
import type { CustomSession, AssertedUser } from '@lib/types/api';

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: backendEnv.GITHUB_ID,
      clientSecret: backendEnv.GITHUB_SECRET
    })
  ],
  callbacks: {
    async session({ session, token }): Promise<CustomSession> {
      const id = token.sub as string;
      const username = await getGithubUsername(id);

      console.log('Session callback - Username:', username); // Debug log

      const typedSession = session as Session & { user: AssertedUser };

      // Temporarily allow all logged-in users as admin for testing
      const admin = true; // username === 'neezar-abd' || username === 'neezarsigmah' || username === 'neezarpl1' || username === 'neezarrpl1' || username === 'ccrsxx';

      console.log('Session callback - Is Admin:', admin); // Debug log

      return {
        ...typedSession,
        user: { ...typedSession.user, id, username, admin }
      };
    }
  }
};

export default NextAuth(authOptions);
