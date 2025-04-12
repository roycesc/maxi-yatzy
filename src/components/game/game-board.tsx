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
    <div className="bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-xl border-b border-black/5 dark:border-white/10 text-zinc-900 dark:text-zinc-50 py-1 rounded-t-2xl flex items-center justify-between shadow-sm">
      <div className="flex flex-1 overflow-x-auto px-3 py-0.5">
        {players.map(player => {
          const filledCategories = Object.values(player.scoreCard).filter(score => score !== null).length;
          
          return (
            <div 
              key={player.id} 
              className={`flex flex-col p-1 rounded-xl mx-1 min-w-[85px] transition-all duration-300 ${
                player.isActive 
                  ? 'bg-blue-500/10 dark:bg-blue-400/15 shadow-[0_0_0_1px_rgba(59,130,246,0.3)]' 
                  : ''
              }`}
            >
              <div className="flex items-center text-xs">
                <div className={`w-1.5 h-1.5 rounded-full ${player.isActive ? 'bg-blue-500 dark:bg-blue-400' : 'bg-zinc-300 dark:bg-zinc-600'} mr-1.5`}></div>
                <div className="font-medium truncate">{player.name}</div>
                <div className="font-semibold text-blue-600 dark:text-blue-400 ml-auto text-xs">
                  {calculateTotal(player.scoreCard)}
                </div>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 text-right mt-0.5">
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
              <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-600 dark:text-zinc-400 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
                <EllipsisVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-xl shadow-lg p-1">
              {/* Auto-roll toggle with Switch component */}
              <div className="flex items-center justify-between px-3 py-2">
                <Label htmlFor="auto-roll" className="text-sm text-zinc-800 dark:text-zinc-200 cursor-pointer">
                  Auto-roll on next turn
                </Label>
                <Switch
                  id="auto-roll"
                  checked={autoRollEnabled}
                  onCheckedChange={setAutoRollEnabled}
                  className="data-[state=checked]:bg-blue-500 dark:data-[state=checked]:bg-blue-500"
                />
              </div>
              
              <DropdownMenuSeparator className="bg-zinc-200/60 dark:bg-zinc-700/60 my-1" />
              
              {/* Leave game option */}
              <AlertDialogTrigger asChild>
                <DropdownMenuItem 
                  className="text-red-600 dark:text-red-500 cursor-pointer focus:bg-red-100/50 dark:focus:bg-red-950/30 focus:text-red-600 dark:focus:text-red-500 rounded-lg mx-1 my-1"
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
          
          <AlertDialogContent className="bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl shadow-xl max-w-sm mx-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Leave Game?</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-600 dark:text-zinc-400">
                This will end your current game session and you'll lose your progress.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 mt-2">
              <AlertDialogCancel className="rounded-xl bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border-none font-medium">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onLeaveGame} className="rounded-xl font-medium bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700">
                Leave Game
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex flex-col bg-[#f6f6f6] dark:bg-[#0d0d0d]">
      {/* Game Over Modal - Show when game is finished */}
      {gameStatus === 'finished' && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="pt-8 pb-4 px-6">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
                {winners.length > 1 ? 'It&apos;s a Tie!' : 'Game Over!'}
              </h2>
              
              <div className="mb-6">
                {winners.length > 1 ? (
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{winners.map(w => w.name).join(' & ')} Win!</p>
                ) : (
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{winners[0]?.name} Wins!</p>
                )}
                <p className="text-zinc-600 dark:text-zinc-400 mt-1">Final Score: {winners[0] ? calculateTotal(winners[0].scoreCard) : 0}</p>
              </div>
            </div>  
            
            <div className="bg-zinc-50 dark:bg-[#2c2c2e] px-6 py-5">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-left">Final Rankings</h3>
              <div className="space-y-2.5 mt-3">
                {players
                  .sort((a, b) => calculateTotal(b.scoreCard) - calculateTotal(a.scoreCard))
                  .map((player, index) => (
                  <div 
                    key={player.id} 
                    className={`flex justify-between p-2.5 rounded-xl ${
                      winners.some(w => w.id === player.id) 
                        ? 'bg-blue-100/70 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-medium'
                        : 'text-zinc-700 dark:text-zinc-300'
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
            
            <div className="bg-white dark:bg-[#1c1c1e] px-6 py-5 border-t border-black/5 dark:border-white/10">
              <p className="mb-4 text-center text-zinc-500 dark:text-zinc-400 text-sm">
                A complete game! All 20 categories filled for each player.
              </p>
              
              <Button 
                onClick={onPlayAgain}
                className="w-full rounded-xl bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium py-2.5 shadow-sm h-12"
              >
                Play Again
              </Button>
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
          <div className="flex-1 bg-[#f6f6f6] dark:bg-[#121212] min-h-0">
            <ScoreCard 
              players={players}
              currentDice={currentDice}
              onScoreSelect={handleScoreSelect}
              currentPlayerId={currentPlayerId}
            />
          </div>
          
          {/* Dice Control Area - Smaller fixed height container that stays on screen */}
          <div className="bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-xl border-t border-black/5 dark:border-white/10 flex-shrink-0">
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