import type { Metadata } from "next";
import AuthProvider from "@/components/layout/auth-provider";
import { Toaster as SonnerToaster } from "sonner";

export const metadata: Metadata = {
  title: "Maxi Yatzy - Game",
  description: "Play Maxi Yatzy online with friends!",
};

// This ensures that this layout doesn't apply the global layout with navbar
export const dynamic = 'force-dynamic';

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full overflow-hidden">
        <AuthProvider>
          {children}
          <SonnerToaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
} 