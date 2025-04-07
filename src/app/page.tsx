'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-700 p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-4xl font-bold text-amber-100 mb-6">Maxi Yatzy</h1>
        <p className="text-xl text-amber-50 mb-8">
          A multiplayer dice game with friends!
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={() => router.push('/play')}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white text-lg py-3 font-semibold"
          >
            Play Demo Game
          </Button>
          
          <Button 
            onClick={() => router.push('/auth/signin')}
            className="w-full bg-white hover:bg-gray-100 text-amber-900 text-lg py-3 font-semibold"
          >
            Sign In
          </Button>
        </div>
        
        <p className="mt-6 text-amber-100">
          Roll dice, choose strategies, and compete for the highest score!
        </p>
      </div>
    </div>
  );
}
