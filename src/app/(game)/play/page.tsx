'use client'

import React, { useState } from 'react'
import GameBoard from '@/components/game/game-board'
import { calculatePotentialScores } from '@/lib/game/scoring'

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

const mockPlayers: Player[] = [
  {
    id: '1',
    name: 'Player 1',
    isActive: true,
    scoreCard: createBlankScoreCard()
  },
  {
    id: '2',
    name: 'Player 2',
    isActive: false,
    scoreCard: createBlankScoreCard()
  },
  {
    id: '3',
    name: 'Player 3',
    isActive: false,
    scoreCard: createBlankScoreCard()
  }
]

export default function PlayPage() {
  const [players, setPlayers] = useState<Player[]>(mockPlayers)
  // Track current player ID in state instead of hard-coding it
  const [currentPlayerId, setCurrentPlayerId] = useState('1')

  const handleScoreSelect = (category: string, dice: number[]) => {
    console.log(`Selected category: ${category} with dice: ${dice.join(', ')}`)
    
    // In a real app, this would be sent to the server.
    // For the demo, we'll just update the local state
    setPlayers(prevPlayers => {
      // Calculate scores properly using the scoring functions
      const potentialScores = calculatePotentialScores(dice)
      
      // Find the next player ID after current
      const currentPlayerIndex = prevPlayers.findIndex(p => p.id === currentPlayerId)
      const nextPlayerIndex = (currentPlayerIndex + 1) % prevPlayers.length
      const nextPlayerId = prevPlayers[nextPlayerIndex].id
      
      // Also update the current player ID to the next player
      setTimeout(() => {
        setCurrentPlayerId(nextPlayerId)
      }, 0)
      
      return prevPlayers.map(player => {
        if (player.id === currentPlayerId) {
          // Update the current player's scorecard with the proper score
          return {
            ...player,
            isActive: false, // End turn
            scoreCard: {
              ...player.scoreCard,
              [category]: potentialScores[category] ?? 0 // Use calculated score instead of sum
            }
          }
        } else if (player.id === nextPlayerId) { // Activate next player
          return {
            ...player,
            isActive: true
          }
        }
        return player
      })
    })
  }

  return (
    <div>
      <GameBoard 
        gameId="demo123"
        players={players}
        currentPlayerId={currentPlayerId}
        onScoreSelect={handleScoreSelect}
      />
    </div>
  )
} 