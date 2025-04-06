import { PrismaAdapter } from '@auth/prisma-adapter';
import { type NextAuthOptions } from 'next-auth';
import { prisma } from '@/lib/db/prisma';
// Import desired providers later, e.g.:
// import CredentialsProvider from 'next-auth/providers/credentials';
// import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Add authentication providers here
    // Example:
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
    // CredentialsProvider({...}) // For username/password
  ],
  session: {
    strategy: 'jwt', // Use JWT for session strategy
  },
  // Add custom pages if needed
  // pages: {
  //   signIn: '/auth/signin',
  // },
  callbacks: {
    // Add callbacks to customize session/token data if needed
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string; // Add user ID to session
        // Add other custom fields from token if needed
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        // Add other custom fields to token if needed
      }
      return token;
    },
  },
  // Ensure you have NEXTAUTH_SECRET and NEXTAUTH_URL set in your .env file
  secret: process.env.NEXTAUTH_SECRET,
}; 