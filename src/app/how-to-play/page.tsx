'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function HowToPlayPage() {
  return (
    <div className="min-h-screen bg-accent-orange/90 flex flex-col items-center pb-12">
      {/* Header */}
      <div className="w-full bg-main-blue py-4 px-4 flex items-center shadow-lg mb-6">
        <Link href="/" className="text-white">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold text-white text-center flex-1 font-heading">
          How To Play
        </h1>
      </div>
      
      <div className="w-full max-w-md px-6 flex flex-col gap-6">
        {/* Game Overview */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-main-blue mb-3 border-b-2 border-main-blue/20 pb-2">
            Game Overview
          </h2>
          <p className="text-gray-700">
            Maxi Yatzy is a dice game where players take turns rolling 6 dice and choosing scoring categories to maximize their points.
          </p>
        </div>
        
        {/* Basic Rules */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-main-blue mb-3 border-b-2 border-main-blue/20 pb-2">
            Basic Rules
          </h2>
          <ul className="text-gray-700 list-disc pl-5 space-y-2">
            <li>Each player takes turns rolling the dice.</li>
            <li>You can roll up to 3 times on your turn.</li>
            <li>After each roll, you can hold dice you want to keep.</li>
            <li>After your final roll, choose a category to score in.</li>
            <li>Each category can only be used once per game.</li>
            <li>The player with the highest total score wins!</li>
          </ul>
        </div>
        
        {/* Scoring Categories */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-main-blue mb-3 border-b-2 border-main-blue/20 pb-2">
            Scoring Categories
          </h2>
          <div className="text-gray-700 space-y-2">
            <p className="font-semibold text-main-blue">Upper Section:</p>
            <p>Ones through Sixes: Sum all dice of that number.</p>
            
            <p className="font-semibold text-main-blue mt-3">Lower Section:</p>
            <p>One Pair: Sum of two matching dice.</p>
            <p>Two Pairs: Sum of two different pairs.</p>
            <p>Three Pairs: Sum of three different pairs.</p>
            <p>Three of a Kind: Sum of three matching dice.</p>
            <p>Four of a Kind: Sum of four matching dice.</p>
            <p>Five of a Kind: Sum of five matching dice.</p>
            <p>Small Straight: 15 points for 1-2-3-4-5.</p>
            <p>Large Straight: 20 points for 2-3-4-5-6.</p>
            <p>Full Straight: 25 points for 1-2-3-4-5-6.</p>
            <p>Full House: Three of a kind and a pair.</p>
            <p>Villa: Four of a kind and a pair.</p>
            <p>Tower: Five of a kind and a pair.</p>
            <p>Chance: Sum of all dice.</p>
            <p>Maxi Yatzy: 100 points for six of a kind.</p>
          </div>
        </div>
        
        {/* Quick Start Button */}
        <Link
          href="/play"
          className="flex items-center justify-center bg-main-blue
                   text-white font-bold text-xl py-4 px-6 rounded-full
                   border-b-4 border-main-blue/50 transform active:translate-y-1 active:border-b-2
                   transition-all shadow-lg mt-4 self-center"
        >
          Start Playing!
        </Link>
      </div>
    </div>
  );
} 