'use client'

import React, { useState, useEffect, useCallback } from 'react'
import GameBoard from '@/components/game/game-board'
import { calculatePotentialScores } from '@/lib/game/scoring'
import { Button } from '@/components/ui/button'

// Use Record type to match what game-board.tsx expects
type ScoreCard = Record<string, number | null>

interface Player {
  id: string
  name: string
  isActive: boolean
  scoreCard: ScoreCard
}

// Initialize a blank score card with all values set to null
const createBlankScoreCard = (): ScoreCard => ({
  ones: null,
  twos: null,
  threes: null,
  fours: null,
  fives: null,
  sixes: null,
  onePair: null,
  twoPairs: null,
  threePairs: null,
  threeOfAKind: null,
  fourOfAKind: null,
  fiveOfAKind: null,
  smallStraight: null,
  largeStraight: null,
  fullStraight: null,
  fullHouse: null,
  villa: null,
  tower: null,
  chance: null,
  maxiYatzy: null
})

// Function to create players based on the count
const createPlayers = (count: number): Player[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: String(index + 1),
    name: `Player ${index + 1}`,
    isActive: index === 0, // First player is active
    scoreCard: createBlankScoreCard()
  }));
};

export default function PlayPage() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerCount, setPlayerCount] = useState(3);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState('1');
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [winners, setWinners] = useState<Player[]>([]);

  // Calculate total score for a player
  const calculateTotal = (scoreCard: ScoreCard): number => {
    return Object.values(scoreCard).reduce((sum: number, score) => sum + (score ?? 0), 0);
  };

  // Wrap checkGameCompletion in useCallback to prevent re-creation on every render
  const checkGameCompletion = useCallback(() => {
    // Game is complete if all players have filled all categories
    const isComplete = players.every(player => {
      return Object.keys(player.scoreCard).length === Object.keys(createBlankScoreCard()).length &&
        Object.values(player.scoreCard).every(score => score !== null);
    });
    
    if (isComplete) {
      console.log('Game completed! Calculating winners...');
      setGameStatus('finished');
      
      // Find the player(s) with the highest score
      const maxScore = Math.max(...players.map(p => calculateTotal(p.scoreCard)));
      const gameWinners = players.filter(p => calculateTotal(p.scoreCard) === maxScore);
      
      setWinners(gameWinners);
    }
  }, [players]);

  const startGame = () => {
    const newPlayers = createPlayers(playerCount);
    
    // Explicitly make sure all score cards are fully blank
    newPlayers.forEach(player => {
      Object.keys(player.scoreCard).forEach(key => {
        player.scoreCard[key] = null;
      });
    });
    
    setPlayers(newPlayers);
    setCurrentPlayerId('1');
    setGameStatus('playing');
    setGameStarted(true);
  };

  // Check for game completion after scores update
  useEffect(() => {
    if (players.length > 0) {
      checkGameCompletion();
    }
  }, [players, checkGameCompletion]);

  const handleScoreSelect = (category: string, dice: number[]) => {
    console.log(`Selected category: ${category} with dice: ${dice.join(', ')}`);
    
    setPlayers(prevPlayers => {
      const potentialScores = calculatePotentialScores(dice);
      
      const currentPlayerIndex = prevPlayers.findIndex(p => p.id === currentPlayerId);
      const nextPlayerIndex = (currentPlayerIndex + 1) % prevPlayers.length;
      const nextPlayerId = prevPlayers[nextPlayerIndex].id;
      
      setTimeout(() => {
        setCurrentPlayerId(nextPlayerId);
      }, 0);
      
      return prevPlayers.map(player => {
        if (player.id === currentPlayerId) {
          return {
            ...player,
            isActive: false,
            scoreCard: {
              ...player.scoreCard,
              [category]: potentialScores[category] ?? 0
            }
          };
        } else if (player.id === nextPlayerId) {
          return {
            ...player,
            isActive: true
          };
        }
        return player;
      });
    });
  };

  const handlePlayAgain = () => {
    // Reset game state to initial state
    setGameStatus('waiting');
    setWinners([]);
    
    // Reset players with completely blank score cards
    setPlayers([]);
    setCurrentPlayerId('1');
    
    // Return to player selection screen
    setGameStarted(false);
  };

  const handleLeaveGame = () => {
    // Similar to handlePlayAgain but with confirmation already handled by AlertDialog
    setGameStatus('waiting');
    setWinners([]);
    setPlayers([]);
    setCurrentPlayerId('1');
    setGameStarted(false);
  };

  // Player selection screen
  if (!gameStarted) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-green-700">
        <div className="bg-amber-50 rounded-lg shadow-xl p-8 w-full max-w-md mx-4">
          <h1 className="text-3xl font-bold text-amber-900 mb-6 text-center">Maxi Yatzy</h1>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-amber-800 mb-3">Select Players</h2>
            
            <div className="flex flex-col gap-4">
              {[2, 3, 4].map(count => (
                <button
                  key={count}
                  onClick={() => setPlayerCount(count)}
                  className={`py-3 px-4 rounded-lg text-lg font-medium transition-colors 
                    ${playerCount === count 
                      ? 'bg-amber-600 text-white border-2 border-amber-300' 
                      : 'bg-amber-100 text-amber-800 border-2 border-transparent hover:bg-amber-200'
                    }`}
                >
                  {count} Players
                </button>
              ))}
            </div>
          </div>
          
          <Button 
            onClick={startGame}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 text-lg font-semibold"
          >
            Start Game
          </Button>
        </div>
      </div>
    );
  }

  // Game board when game has started - return the GameBoard directly without wrapper
  return (
    <GameBoard 
      gameId="demo123"
      players={players}
      currentPlayerId={currentPlayerId}
      onScoreSelect={handleScoreSelect}
      gameStatus={gameStatus}
      winners={winners}
      onPlayAgain={handlePlayAgain}
      onLeaveGame={handleLeaveGame}
    />
  );
} 