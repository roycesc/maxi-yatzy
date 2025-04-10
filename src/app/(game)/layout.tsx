import type { Metadata } from "next";
import AuthProvider from "@/components/layout/auth-provider";
import { Toaster as SonnerToaster } from "sonner";
import GameWrapper from './game-wrapper';

export const metadata: Metadata = {
  title: "Maxi Yatzy - Game",
  description: "Play Maxi Yatzy online with friends!",
};

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <GameWrapper>
        {children}
        <SonnerToaster richColors position="top-right" />
      </GameWrapper>
    </AuthProvider>
  );
} 