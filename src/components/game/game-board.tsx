'use client'

import React, { useState, useEffect } from 'react'
import DiceContainer from './dice-container'
import ScoreCard from './score-card'
import { Button } from '@/components/ui/button'
import { calculatePotentialScores } from '@/lib/game/scoring'

interface Player {
  id: string
  name: string
  scoreCard: Record<string, number | null>
  isActive: boolean
}

interface GameBoardProps {
  gameId: string
  players: Player[]
  currentPlayerId?: string
  onScoreSelect?: (category: string, dice: number[]) => void
  isSpectator?: boolean
  gameStatus?: 'waiting' | 'playing' | 'finished'
  winners?: Player[]
  onPlayAgain?: () => void
}

const GameBoard: React.FC<GameBoardProps> = ({
  gameId,
  players,
  currentPlayerId,
  onScoreSelect,
  isSpectator = false,
  gameStatus = 'playing',
  winners = [],
  onPlayAgain
}) => {
  const [currentDice, setCurrentDice] = useState<number[]>([])

  // Debug the players prop to see if it has the expected structure
  useEffect(() => {
    console.log('Game board received players:', JSON.stringify(players, null, 2))
  }, [players])

  const handleDiceRoll = (dice: number[]) => {
    setCurrentDice(dice)
  }

  const handleScoreSelect = (category: string) => {
    if (onScoreSelect) {
      onScoreSelect(category, currentDice)
    }
    // In a real implementation, this would be handled by the server
    // and we'd just wait for the next update, but for this UI prototype
    // we'll just clear the dice
    setCurrentDice([])
  }

  const isCurrentPlayer = currentPlayerId && players.find(p => p.id === currentPlayerId)?.isActive

  // Calculate the total score for a player
  const calculateTotal = (scoreCard: Record<string, number | null>): number => {
    return Object.values(scoreCard).reduce((sum: number, score) => sum + (score ?? 0), 0);
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto bg-green-700 min-h-screen p-4 space-y-6">
      {/* Game Header */}
      <div className="bg-amber-800 text-white rounded-lg p-3 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold">Maxi Yatzy</div>
          <div className="text-sm bg-green-800 px-3 py-1 rounded-full">
            Game #{gameId.slice(0, 6)}
          </div>
        </div>
        <div className="mt-2 flex justify-between">
          <div className="text-sm">
            {gameStatus === 'waiting' && 'Waiting for players...'}
            {gameStatus === 'playing' && `Current turn: ${players.find(p => p.isActive)?.name || 'Unknown'}`}
            {gameStatus === 'finished' && 'Game finished!'}
          </div>
          <div>
            {gameStatus === 'playing' && isCurrentPlayer ? (
              <span className="text-sm bg-amber-600 px-2 py-1 rounded-full">Your turn</span>
            ) : null}
          </div>
        </div>
      </div>
      
      {/* Score Header */}
      <div className="bg-amber-900/90 text-white p-2 rounded-lg shadow-md">
        <div className={`grid gap-2 ${
          players.length === 2 ? 'grid-cols-2' : 
          players.length === 3 ? 'grid-cols-3' : 
          'grid-cols-4'
        }`}>
          {players.map(player => {
            // Calculate how many categories have been filled
            const filledCategories = Object.values(player.scoreCard).filter(score => score !== null).length;
            const progressPercent = Math.round((filledCategories / 20) * 100);
            
            return (
              <div 
                key={player.id} 
                className={`flex flex-col p-2 rounded-md ${
                  player.isActive ? 'bg-amber-700' : ''
                } ${
                  winners.some(w => w.id === player.id) ? 'bg-amber-500' : ''
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="font-medium truncate">{player.name}</div>
                  <div className="font-bold text-amber-300 ml-auto">
                    {calculateTotal(player.scoreCard)}
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-2 h-2 bg-amber-950 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-400"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <div className="text-xs text-amber-200 mt-1 text-right">
                  {filledCategories}/20 filled
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Game Over Modal - Show when game is finished */}
      {gameStatus === 'finished' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-amber-100 p-6 rounded-lg max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-amber-900 mb-4">
              {winners.length > 1 ? 'It\'s a Tie!' : 'Game Over!'}
            </h2>
            
            <div className="mb-6">
              {winners.length > 1 ? (
                <p className="text-xl font-bold">{winners.map(w => w.name).join(' & ')} Win!</p>
              ) : (
                <p className="text-xl font-bold">{winners[0]?.name} Wins!</p>
              )}
              <p className="text-amber-700">Final Score: {winners[0] ? calculateTotal(winners[0].scoreCard) : 0}</p>
            </div>
            
            <div className="space-y-2 mb-6">
              <h3 className="font-semibold">Final Rankings:</h3>
              {players
                .sort((a, b) => calculateTotal(b.scoreCard) - calculateTotal(a.scoreCard))
                .map((player, index) => (
                <div 
                  key={player.id} 
                  className={`flex justify-between p-2 ${
                    winners.some(w => w.id === player.id) 
                      ? 'bg-amber-200 rounded-md font-bold'
                      : ''
                  }`}
                >
                  <span>
                    {index + 1}. {player.name}
                    {winners.some(w => w.id === player.id) && ' 🏆'}
                  </span>
                  <span className="font-medium">{calculateTotal(player.scoreCard)}</span>
                </div>
              ))}
            </div>
            
            <p className="mb-6 text-center text-amber-700 text-sm">
              A complete game! All 20 categories filled for each player.
            </p>
            
            <Button 
              onClick={onPlayAgain}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2"
            >
              Play Again
            </Button>
          </div>
        </div>
      )}
      
      {/* Main Game Area */}
      <div className="flex flex-col md:flex-row gap-6 flex-grow">
        {/* Mobile: Accordion layout for score card on small screens */}
        <div className="lg:hidden w-full">
          <details className="bg-amber-50 rounded-lg overflow-hidden shadow-lg">
            <summary className="bg-amber-800 text-white px-4 py-2 cursor-pointer font-medium">
              View Score Card
            </summary>
            <div className="p-2">
              <ScoreCard 
                players={players}
                currentDice={currentDice}
                onScoreSelect={handleScoreSelect}
                currentPlayerId={currentPlayerId}
              />
            </div>
          </details>
        </div>
        
        {/* Desktop: Side-by-side layout */}
        <div className="hidden lg:block lg:w-3/4">
          <ScoreCard 
            players={players}
            currentDice={currentDice}
            onScoreSelect={handleScoreSelect}
            currentPlayerId={currentPlayerId}
          />
        </div>
        
        {/* Dice Container - Shown On All Screens */}
        <div className="w-full lg:w-1/4 flex flex-col justify-start items-center">
          <div className="bg-green-800 rounded-lg p-4 shadow-lg w-full">
            <DiceContainer 
              onRoll={handleDiceRoll} 
              disabled={isSpectator || !isCurrentPlayer || gameStatus !== 'playing'}
              playerId={currentPlayerId}
            />
          </div>
          
          {/* Game Controls */}
          <div className="mt-4 flex flex-col space-y-3 w-full">
            <Button
              variant="outline"
              className="bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
            >
              Game Rules
            </Button>
            
            <Button
              variant="outline"
              className="bg-red-100 text-red-900 border-red-300 hover:bg-red-200"
            >
              Leave Game
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameBoard 