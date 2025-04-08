'use client'

import React, { useState, useEffect } from 'react'
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

  // Start game with selected number of players
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

  // Check if the game is complete (all categories filled by all players)
  const checkGameCompletion = () => {
    // First check if we have any players
    if (players.length === 0) {
      return;
    }
    
    // Game is complete when ALL categories (20) are filled for each player
    const isGameComplete = players.every(player => {
      const filledCategories = Object.values(player.scoreCard).filter(score => score !== null).length;
      const complete = filledCategories >= 20; // All 20 categories must be filled
      console.log(`Player ${player.name} has ${filledCategories}/20 filled categories, complete: ${complete}`);
      return complete;
    });
    
    console.log("Game complete?", isGameComplete);

    if (isGameComplete) {
      // Find the highest score among all players
      const playerScores = players.map(player => {
        const score = Object.values(player.scoreCard).reduce((sum: number, score) => sum + (score ?? 0), 0);
        console.log(`${player.name} total score: ${score}`);
        return { player, score };
      });
      
      const maxScore = Math.max(...playerScores.map(p => p.score));
      console.log("Max score:", maxScore);
      
      // All players with the highest score are winners (allows for ties)
      const gameWinners = playerScores
        .filter(p => p.score === maxScore)
        .map(p => p.player);
      
      console.log("Winners:", gameWinners.map(w => w.name));
      
      setWinners(gameWinners);
      setGameStatus('finished');
    }
  };

  // Check for game completion after scores update
  useEffect(() => {
    if (players.length > 0) {
      checkGameCompletion();
    }
  }, [players]);

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

  // Player selection screen
  if (!gameStarted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-green-700">
        <div className="bg-amber-50 rounded-lg shadow-xl p-8 w-full max-w-md">
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

  // Game board when game has started
  return (
    <div>
      <GameBoard 
        gameId="demo123"
        players={players}
        currentPlayerId={currentPlayerId}
        onScoreSelect={handleScoreSelect}
        gameStatus={gameStatus}
        winners={winners}
        onPlayAgain={handlePlayAgain}
      />
    </div>
  );
} 