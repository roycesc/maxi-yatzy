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
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu"
import { EllipsisVertical } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

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
  const [autoRollEnabled, setAutoRollEnabled] = useState(false)

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
    <div className="bg-white border-b-2 border-main-blue/20 py-1 rounded-t-2xl flex items-center justify-between shadow-sm">
      <div className="flex flex-1 overflow-x-auto px-3 py-0.5">
        {players.map(player => {
          const filledCategories = Object.values(player.scoreCard).filter(score => score !== null).length;
          
          return (
            <div 
              key={player.id} 
              className={`flex flex-col p-1 rounded-xl mx-1 min-w-[85px] transition-all duration-300 ${
                player.isActive 
                  ? 'bg-main-blue/10 shadow-[0_0_0_1px_rgba(74,144,226,0.3)]' 
                  : ''
              }`}
            >
              <div className="flex items-center text-xs">
                <div className={`w-1.5 h-1.5 rounded-full ${player.isActive ? 'bg-main-blue' : 'bg-gray-300'} mr-1.5`}></div>
                <div className="font-medium truncate">{player.name}</div>
                <div className="font-semibold text-main-blue ml-auto text-xs">
                  {calculateTotal(player.scoreCard)}
                </div>
              </div>
              <div className="text-xs text-gray-500 text-right mt-0.5">
                {filledCategories}/20
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Options Menu */}
      <div className="mr-2">
        <AlertDialog>
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-main-blue rounded-full hover:bg-main-blue/5">
                <EllipsisVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-2 border-main-blue/20 rounded-xl shadow-lg p-1">
              {/* Auto-roll toggle with Switch component */}
              <div className="flex items-center justify-between px-3 py-2">
                <Label htmlFor="auto-roll" className="text-sm text-gray-800 cursor-pointer">
                  Auto-roll on next turn
                </Label>
                <Switch
                  id="auto-roll"
                  checked={autoRollEnabled}
                  onCheckedChange={setAutoRollEnabled}
                  className="data-[state=checked]:bg-main-blue"
                />
              </div>
              
              <DropdownMenuSeparator className="bg-main-blue/10 my-1" />
              
              {/* Leave game option */}
              <AlertDialogTrigger asChild>
                <DropdownMenuItem 
                  className="text-error-red cursor-pointer focus:bg-error-red/10 focus:text-error-red rounded-lg mx-1 my-1"
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
          
          <AlertDialogContent className="bg-white rounded-xl border-2 border-main-blue shadow-xl max-w-sm mx-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-main-blue">Leave Game?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-700">
                This will end your current game session and you'll lose your progress.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 mt-2">
              <AlertDialogCancel className="rounded-full bg-white border-2 border-main-blue/40 hover:border-main-blue text-main-blue font-medium py-2 px-5">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onLeaveGame} className="rounded-full font-medium bg-error-red hover:bg-error-red/90 text-white py-2 px-5 border-b-4 border-error-red/50 shadow-md">
                Leave Game
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex flex-col bg-accent-orange/10">
      {/* Game Over Modal - Show when game is finished */}
      {gameStatus === 'finished' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border-2 border-main-blue rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="pt-8 pb-4 px-6">
              <h2 className="text-2xl font-bold text-main-blue mb-4">
                {winners.length > 1 ? 'It\'s a Tie!' : 'Game Over!'}
              </h2>
              
              <div className="mb-6">
                {winners.length > 1 ? (
                  <p className="text-xl font-bold text-accent-orange">{winners.map(w => w.name).join(' & ')} Win!</p>
                ) : (
                  <p className="text-xl font-bold text-accent-orange">{winners[0]?.name} Wins!</p>
                )}
                <p className="text-gray-600 mt-1">Final Score: {winners[0] ? calculateTotal(winners[0].scoreCard) : 0}</p>
              </div>
            </div>  
            
            <div className="bg-gray-50 px-6 py-5">
              <h3 className="font-semibold text-main-blue text-left">Final Rankings</h3>
              <div className="space-y-2.5 mt-3">
                {players
                  .sort((a, b) => calculateTotal(b.scoreCard) - calculateTotal(a.scoreCard))
                  .map((player, index) => (
                  <div 
                    key={player.id} 
                    className={`flex justify-between p-2.5 rounded-xl ${
                      winners.some(w => w.id === player.id) 
                        ? 'bg-accent-orange/10 text-accent-orange font-medium'
                        : 'text-gray-700'
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
            </div>
            
            <div className="bg-white px-6 py-5 border-t border-gray-200">
              <p className="mb-4 text-center text-gray-500 text-sm">
                A complete game! All 20 categories filled for each player.
              </p>
              
              <button 
                onClick={onPlayAgain}
                className="w-full rounded-full bg-main-blue hover:bg-main-blue/90 
                  text-white font-bold text-lg py-4 px-6
                  border-b-4 border-main-blue/50 transform active:translate-y-1 active:border-b-2
                  transition-all shadow-lg"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Game Area - Full viewport layout */}
      <div className="flex flex-col h-full">
        {/* Compact Player Stats with Menu */}
        <CompactPlayerStats />
        
        {/* Game content with proper layout */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Score Card - Fixed height container with proper horizontal scrolling */}
          <div className="flex-1 bg-white/50 min-h-0">
            <ScoreCard 
              players={players}
              currentDice={currentDice}
              onScoreSelect={handleScoreSelect}
              currentPlayerId={currentPlayerId}
            />
          </div>
          
          {/* Dice Control Area - Smaller fixed height container that stays on screen */}
          <div className="bg-white border-t-2 border-main-blue/20 flex-shrink-0">
            <DiceContainer 
              onRoll={handleDiceRoll} 
              disabled={isSpectator || !isCurrentPlayer || gameStatus !== 'playing'}
              playerId={currentPlayerId}
              autoRollEnabled={autoRollEnabled}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameBoard 