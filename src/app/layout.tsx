import type { Metadata } from "next";
import { Noto_Sans, Noto_Sans_Mono } from "next/font/google";
import "@/app/globals.css";
import AuthProvider from "@/components/layout/auth-provider";
import Header from "@/components/layout/header";
import { Toaster as SonnerToaster } from "sonner";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  weight: ["400", "500", "700"],
});

const notoMono = Noto_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-noto-mono",
  weight: ["400", "700"],
});

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
    <html lang="en" className={`${notoSans.variable} ${notoMono.variable}`}>
      <body className={`font-sans bg-background text-foreground`}>
        <AuthProvider>
          <Header />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <SonnerToaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
