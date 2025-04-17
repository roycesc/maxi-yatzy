import { PrismaAdapter } from '@auth/prisma-adapter';
import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcrypt';

// Define a type for our user
type UserWithPassword = {
  id: string;
  email: string;
  password: string | null;
  name: string | null;
  username: string | null;
  image: string | null;
};

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
        email: { label: "Email", type: "email", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find user in the database and explicitly type it
        const user: UserWithPassword | null = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // If user exists and has a password set (might be null for OAuth users)
        // Using `as any` as a workaround for persistent TS errors not recognizing the password field,
        // despite schema changes and prisma generate. Assume password exists at runtime.
        if (!user || !user.password) {
          return null;
        }

        // Validate password
        const isValidPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isValidPassword) {
          return null;
        }

        // Return user object matching User type, including custom fields
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
    strategy: 'jwt', // JWT strategy is required for Credentials provider
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
    /**
     * Controls the session object returned to the client (e.g., via useSession).
     * Ensures data added to the JWT token is included in the session object.
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string; // Ensure ID is always present
        session.user.name = token.name as string | null; // Pass name from token
        session.user.email = token.email as string | null; // Pass email from token
      }
      return session;
    },
    /**
     * Controls the JWT token contents.
     * Called on sign-in, subsequent requests, and when `useSession().update()` is called.
     */
    async jwt({ token, user, trigger, session }) {
      // 1. Initial sign-in: Copy user data to token
      if (user) {
        token.sub = user.id; // Standard JWT subject claim
        token.name = user.name;
        token.email = user.email;
        // Copy other relevant user fields here if needed
      }

      // 2. `useSession().update()` trigger: Merge update data into token
      // This allows client-side updates (like name change) to reflect quickly.
      if (trigger === "update" && session) {
        // Merge the session data passed from update() into the token
        // Example: If update({ name: "New Name" }) was called, session.name will be "New Name"
        token.name = session.name;
        token.email = session.email; // Example if email could also be updated
      }

      // 3. Subsequent requests/refreshes: Ensure token matches database
      // This acts as a safeguard and keeps the session eventually consistent with the DB.
      // It runs *after* the update trigger logic, potentially overwriting it if DB differs.
      if (token.sub) { // Only run if user is logged in (token exists)
          try {
              // Fetch the latest user data directly from the database
              const dbUser = await prisma.user.findUnique({
                  where: { id: token.sub },
                  select: { name: true, email: true, username: true }, // Select only needed fields
              });
              if (dbUser) {
                  // Update token fields with the latest data from the database
                  token.name = dbUser.name;
                  token.email = dbUser.email;
                  // Assign username to token if needed
                  // token.username = dbUser.username;
              }
          } catch (error) {
              // Avoid failing the request if DB fetch errors, but log it.
              // Token might become stale in this case.
          }
      }

      return token;
    },
  },
  // Ensure you have NEXTAUTH_SECRET and NEXTAUTH_URL set in your .env file
  secret: process.env.NEXTAUTH_SECRET,
  // Enable debug messages in the console if you are having problems
  // debug: process.env.NODE_ENV === 'development',
}; 