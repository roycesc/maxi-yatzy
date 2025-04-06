'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })} // Redirect to home after sign out
      className="mt-2 px-4 py-1 bg-neutral text-white rounded hover:bg-neutral/80 text-sm"
    >
      Sign Out
    </button>
  );
}

// You could add a SignInButton component here too if needed elsewhere
// export function SignInButton() {
//   return (
//     <button
//       onClick={() => signIn()}
//       className="px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
//     >
//       Sign In
//     </button>
//   );
// } 