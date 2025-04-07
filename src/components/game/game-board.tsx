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
}

const GameBoard: React.FC<GameBoardProps> = ({
  gameId,
  players,
  currentPlayerId,
  onScoreSelect,
  isSpectator = false,
}) => {
  const [currentDice, setCurrentDice] = useState<number[]>([])
  const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'finished'>('playing')

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
      <div className="bg-amber-900/90 text-white p-2 rounded-lg shadow-md flex flex-wrap justify-around">
        {players.map(player => (
          <div 
            key={player.id} 
            className={`flex items-center space-x-2 p-2 ${player.isActive ? 'bg-amber-700 rounded-md' : ''}`}
          >
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="font-medium">{player.name}</div>
            <div className="font-bold text-amber-300">
              {Object.values(player.scoreCard).reduce((sum: number, score) => sum + (score ?? 0), 0)}
            </div>
          </div>
        ))}
      </div>
      
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
              disabled={isSpectator || !isCurrentPlayer}
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