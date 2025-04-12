'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-accent-orange/90 overflow-hidden">
      {/* Game Logo/Banner Section */}
      <div className="w-full bg-accent-orange py-8 flex justify-center shadow-lg">
        <div className="relative w-full max-w-md h-32 sm:h-40">
          <h1 className="relative z-10 text-5xl sm:text-6xl font-bold text-white text-center font-heading 
            drop-shadow-[0_4px_0_rgba(0,0,0,0.4)] tracking-wider transform -rotate-2">
            MAXI-YATZY
          </h1>
          <div className="absolute -bottom-3 left-0 right-0 h-4 bg-black/20 rounded-full blur-sm"></div>
        </div>
      </div>
      
      {/* Game Character/Image Section */}
      <div className="relative w-full max-w-md h-56 my-4 flex justify-center items-center">
        <div className="absolute w-40 h-40 bg-main-blue rounded-full opacity-20 animate-pulse"></div>
        <div className="relative z-10 w-full flex justify-center items-center">
          <Image 
            src="/images/maxi-yatzy-background.svg"
            alt="Maxi Yatzy game"
            width={280}
            height={200}
            className="object-contain rounded-lg shadow-lg border-4 border-white transform rotate-3"
            priority
          />
        </div>
      </div>
      
      {/* Game Actions Section */}
      <div className="w-full max-w-xs flex flex-col gap-4 mt-6">
        {/* Quick Start Button */}
        <Link
          href="/play"
          className="flex items-center justify-center bg-main-blue hover:bg-main-blue/90 
                   text-white font-bold text-xl py-4 px-6 rounded-full
                   border-b-4 border-main-blue/50 transform active:translate-y-1 active:border-b-2
                   transition-all shadow-lg"
        >
          Quick Start
          <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
        
        {/* How To Play Button */}
        <Link
          href="/how-to-play"
          className="bg-white hover:bg-white/90 
                   text-main-blue font-bold py-4 px-6 rounded-full
                   border-b-4 border-main-blue/20 transform active:translate-y-1 active:border-b-2
                   transition-all shadow-md flex items-center justify-center"
        >
          How To Play
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </Link>
      </div>
      
      {/* Dice decorations */}
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/20 rounded-lg rotate-12"></div>
      <div className="absolute top-32 -right-10 w-20 h-20 bg-white/20 rounded-lg -rotate-12"></div>
      <div className="absolute bottom-40 -left-6 w-16 h-16 bg-white/20 rounded-lg rotate-45"></div>
      
      {/* Footer */}
      <div className="mt-auto py-6 text-white/70 text-sm text-center">
        <p>© {new Date().getFullYear()} Maxi Yatzy</p>
      </div>
    </main>
  );
}
