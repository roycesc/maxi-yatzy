'use client'

import React, { useState, useEffect } from 'react'
import DiceContainer from './dice-container'
import ScoreCard from './score-card'
import { Button } from '@/components/ui/button'
import { calculatePotentialScores } from '@/lib/game/scoring'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EllipsisVertical } from 'lucide-react'

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
  onLeaveGame?: () => void
}

const GameBoard: React.FC<GameBoardProps> = ({
  gameId,
  players,
  currentPlayerId,
  onScoreSelect,
  isSpectator = false,
  gameStatus = 'playing',
  winners = [],
  onPlayAgain,
  onLeaveGame
}) => {
  const [currentDice, setCurrentDice] = useState<number[]>([])
  const [menuOpen, setMenuOpen] = useState(false)

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

  // Show compact player stats at the top for mobile with kabab menu
  const CompactPlayerStats = () => (
    <div className="bg-amber-900/90 text-white p-1 rounded-t-lg flex items-center justify-between">
      <div className="flex flex-1 overflow-x-auto">
        {players.map(player => {
          const filledCategories = Object.values(player.scoreCard).filter(score => score !== null).length;
          
          return (
            <div 
              key={player.id} 
              className={`flex flex-col p-1 rounded-md mx-1 min-w-[80px] ${
                player.isActive ? 'bg-amber-700' : ''
              }`}
            >
              <div className="flex items-center text-sm">
                <div className={`w-2 h-2 rounded-full ${player.isActive ? 'bg-green-500' : 'bg-amber-500'} mr-1`}></div>
                <div className="font-medium truncate">{player.name}</div>
                <div className="font-bold text-amber-300 ml-auto text-xs">
                  {calculateTotal(player.scoreCard)}
                </div>
              </div>
              <div className="text-xs text-amber-200 text-right">
                {filledCategories}/20
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Kabab Menu for Game Options */}
      <div className="ml-1">
        <AlertDialog>
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-100 hover:bg-amber-800">
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-amber-100">
              <AlertDialogTrigger asChild>
                <DropdownMenuItem 
                  className="text-red-600 cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                  }}
                >
                  Leave Game
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to leave?</AlertDialogTitle>
              <AlertDialogDescription>
                This will end your current game session. You will lose your progress.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onLeaveGame} className="bg-red-500 hover:bg-red-600">
                Leave Game
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex flex-col bg-green-700">
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
      
      {/* Main Game Area - Full viewport layout */}
      <div className="flex flex-col h-full">
        {/* Compact Player Stats with Menu - Always visible on all screen sizes */}
        <CompactPlayerStats />
        
        {/* Content Area with ScoreCard and Dice */}
        <div className="flex flex-col flex-grow overflow-hidden">
          {/* Score Card - Takes most of the space */}
          <div className="flex-grow overflow-y-auto bg-amber-50">
            <ScoreCard 
              players={players}
              currentDice={currentDice}
              onScoreSelect={handleScoreSelect}
              currentPlayerId={currentPlayerId}
            />
          </div>
          
          {/* Fixed Bottom Area for Dice Controls (without Leave Game button) */}
          <div className="bg-green-800 p-2">
            {/* Dice Container */}
            <DiceContainer 
              onRoll={handleDiceRoll} 
              disabled={isSpectator || !isCurrentPlayer || gameStatus !== 'playing'}
              playerId={currentPlayerId}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameBoard 