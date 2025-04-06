import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/options";
import Link from "next/link";
import { SignOutButton } from "@/components/layout/auth-buttons"; // We will create this next

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-heading mb-4">Maxi Yatzy Online</h1>
      <p className="text-lg text-neutral mb-8">Welcome!</p>

      <div className="space-y-4">
        {session?.user ? (
          <div className="text-center">
            <p>Signed in as <span className="font-semibold">{session.user.name || session.user.email || session.user.id}</span></p>
            <SignOutButton />
            {/* Add link to start game etc. */}
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <p>You are not signed in.</p>
            <Link href="/api/auth/signin" className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
              Sign In
            </Link>
            {/* Optional: Add link to Sign Up page */}
            {/* <Link href="/auth/signup" className="text-sm text-primary hover:underline">
              Create an Account
            </Link> */}
          </div>
        )}
      </div>
    </div>
  );
}
