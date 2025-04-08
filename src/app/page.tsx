'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-amber-50">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono flex flex-col">
        <h1 className="text-5xl font-bold text-amber-800 mb-8">Maxi Yatzy</h1>
        
        <p className="text-center mb-8 text-lg">
          A multiplayer dice game with 6 dice and 20 scoring categories.
        </p>
        
        <div className="mt-6 flex flex-col gap-4 w-full max-w-xs">
          <Link
            href="/play"
            className="group w-full rounded-lg border border-amber-300 px-5 py-4 
                    bg-amber-600 hover:bg-amber-700 transition-colors
                    text-center text-white font-bold"
          >
            Play Demo Game
          </Link>
          
          <Link
            href="/play/test"
            className="group w-full rounded-lg border border-blue-300 px-5 py-4
                     bg-blue-600 hover:bg-blue-700 transition-colors
                     text-center text-white font-bold"
          >
            Test Game End Logic
          </Link>
        </div>
      </div>
    </main>
  );
}
