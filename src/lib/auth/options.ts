import { PrismaAdapter } from '@auth/prisma-adapter';
import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcrypt';
import { User as PrismaUser } from '@prisma/client';
// Import desired providers later, e.g.:
// import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Add authentication providers here
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: 'Credentials',
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) {
          console.error('Credentials missing');
          return null;
        }

        // Find user in the database and explicitly type it
        const user: PrismaUser | null = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        // If user exists and has a password set (might be null for OAuth users)
        // Using `as any` as a workaround for persistent TS errors not recognizing the password field,
        // despite schema changes and prisma generate. Assume password exists at runtime.
        if (!user || !(user as any).password) {
          console.error('No user found or password not set for:', credentials.username);
          return null;
        }

        // Validate password
        const isValidPassword = await bcrypt.compare(credentials.password, (user as any).password);

        if (!isValidPassword) {
          console.error('Invalid password for:', credentials.username);
          return null;
        }

        console.log('User authorized:', user.username);
        // Return user object if credentials are valid
        // Match the expected return type for authorize (subset of user object)
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      }
    }),
    // Example:
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
  ],
  session: {
    strategy: 'jwt', // Use JWT for session strategy is REQUIRED for Credentials provider
  },
  // Add custom pages if needed
  pages: {
    signIn: '/auth/signin', // Redirect users to custom sign-in page
    // signOut: '/auth/signout',
    // error: '/auth/error', // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // (Used for email/passwordless login)
    // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out to disable)
  },
  callbacks: {
    // Add callbacks to customize session/token data if needed
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string; // Add user ID to session
        // You can add other properties from the token to the session here
        // session.user.username = token.username; // Example if added in jwt callback
      }
      return session;
    },
    async jwt({ token, user }) {
      // The 'user' object is available on initial sign-in
      if (user) {
        token.sub = user.id;
        // Add other properties from the user object to the token here if needed
        // token.username = user.username; // Example
      }
      return token;
    },
  },
  // Ensure you have NEXTAUTH_SECRET and NEXTAUTH_URL set in your .env file
  secret: process.env.NEXTAUTH_SECRET,
  // Enable debug messages in the console if you are having problems
  // debug: process.env.NODE_ENV === 'development',
}; 