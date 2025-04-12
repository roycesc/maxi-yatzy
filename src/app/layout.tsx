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
      <body className={`font-sans bg-background text-foreground min-h-screen flex flex-col`}>
        <AuthProvider>
          <Header />
          <main className="flex-grow container mx-auto px-4 py-6">
            {children}
          </main>
          <footer className="bg-main-blue text-white py-4 mt-auto">
            <div className="container mx-auto px-4 text-center text-sm">
              <p>&copy; {new Date().getFullYear()} Maxi Yatzy. All rights reserved.</p>
            </div>
          </footer>
          <SonnerToaster 
            richColors
            position="top-right"
            toastOptions={{
              style: { 
                background: 'white',
                border: '2px solid #4A90E2',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
