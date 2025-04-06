import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";
import "@/app/globals.css";
import AuthProvider from "@/components/layout/auth-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });

export const metadata: Metadata = {
  title: "Maxi Yatzy Online",
  description: "Play Maxi Yatzy online with friends!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${nunito.variable}`}>
      <body className={`font-sans bg-background text-foreground`}>
        <AuthProvider>
          <main className="min-h-screen flex flex-col items-center justify-center">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
