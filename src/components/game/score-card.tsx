'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { calculatePotentialScores } from '@/lib/game/scoring'

interface ScoreCardProps {
  players: Array<{
    id: string;
    name: string;
    scoreCard: Record<string, number | null>;
    isActive: boolean;
  }>;
  currentDice?: number[];
  onScoreSelect?: (category: string) => void;
  currentPlayerId?: string;
}

const UPPER_SECTION = [
  { id: 'ones', label: 'Ones' },
  { id: 'twos', label: 'Twos' },
  { id: 'threes', label: 'Threes' },
  { id: 'fours', label: 'Fours' },
  { id: 'fives', label: 'Fives' },
  { id: 'sixes', label: 'Sixes' },
];

const LOWER_SECTION = [
  { id: 'onePair', label: 'One Pair' },
  { id: 'twoPairs', label: 'Two Pairs' },
  { id: 'threePairs', label: 'Three Pairs' },
  { id: 'threeOfAKind', label: 'Three of a Kind' },
  { id: 'fourOfAKind', label: 'Four of a Kind' },
  { id: 'fiveOfAKind', label: 'Five of a Kind' },
  { id: 'smallStraight', label: 'Small Straight' },
  { id: 'largeStraight', label: 'Large Straight' },
  { id: 'fullStraight', label: 'Full Straight' },
  { id: 'fullHouse', label: 'Full House' },
  { id: 'villa', label: 'Villa' },
  { id: 'tower', label: 'Tower' },
  { id: 'chance', label: 'Chance' },
  { id: 'maxiYatzy', label: 'Maxi Yatzy' },
];

const ScoreCard: React.FC<ScoreCardProps> = ({
  players,
  currentDice = [],
  onScoreSelect,
  currentPlayerId,
}) => {
  const potentialScores = currentDice.length === 6 
    ? calculatePotentialScores(currentDice) 
    : {};
  
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  
  const renderScoreCell = (playerId: string, category: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return null;
    
    const score = player.scoreCard[category];
    const isCurrentPlayersTurn = playerId === currentPlayerId;
    const isSelectable = isCurrentPlayersTurn && score === null && currentDice.length === 6;
    const potentialScore = isSelectable ? potentialScores[category] : null;
    
    return (
      <td 
        key={`${playerId}-${category}`}
        className={cn(
          "border-b border-zinc-200 dark:border-zinc-800 text-center py-1.5 px-1 text-sm",
          isCurrentPlayersTurn && "bg-blue-50/50 dark:bg-blue-900/10",
          isSelectable && "cursor-pointer hover:bg-blue-100/70 dark:hover:bg-blue-900/20 transition-colors duration-150",
          score !== null && "text-zinc-900 dark:text-zinc-100 font-medium"
        )}
        onClick={() => isSelectable && onScoreSelect && onScoreSelect(category)}
      >
        {score !== null ? (
          <span>{score}</span>
        ) : (
          isSelectable && potentialScore !== undefined ? (
            <span className="text-blue-600 dark:text-blue-400 opacity-70">{potentialScore}</span>
          ) : null
        )}
      </td>
    );
  };

  const calculateUpperSectionSubtotal = (scoreCard: Record<string, number | null>) => {
    return UPPER_SECTION.reduce((sum, category) => {
      const score = scoreCard[category.id];
      return sum + (score ?? 0);
    }, 0);
  };

  const calculateUpperSectionBonus = (scoreCard: Record<string, number | null>) => {
    const upperTotal = calculateUpperSectionSubtotal(scoreCard);
    return upperTotal >= 84 ? 100 : 0;
  };

  const calculateTotal = (scoreCard: Record<string, number | null>) => {
    const upperTotal = calculateUpperSectionSubtotal(scoreCard);
    const bonus = calculateUpperSectionBonus(scoreCard);
    
    const lowerTotal = LOWER_SECTION.reduce((sum, category) => {
      const score = scoreCard[category.id];
      return sum + (score ?? 0);
    }, 0);
    
    return upperTotal + bonus + lowerTotal;
  };

  // Replace these functions with simpler ones that always show all categories
  // No need to filter categories anymore
  const availableUpperSection = UPPER_SECTION;
  const availableLowerSection = LOWER_SECTION;

  return (
    <div className="w-full h-full flex flex-col px-2 py-0.5">
      <div className="overflow-auto rounded-2xl border border-zinc-200/70 dark:border-zinc-800/80 shadow-sm h-full flex flex-col">
        <div className="min-w-max"> {/* Prevents table from shrinking smaller than content */}
          <table className="w-full border-collapse bg-white dark:bg-zinc-900 text-xs">
            <thead className="sticky top-0 z-20">
              <tr className="bg-gradient-to-r from-blue-600/95 to-blue-500/95 dark:from-blue-700/95 dark:to-blue-600/95 text-white">
                <th className="px-2 py-1.5 text-left font-medium border-r border-blue-400/30 dark:border-blue-500/30 w-[90px]">
                  Category
                </th>
                {players.map(player => (
                  <th 
                    key={player.id} 
                    className={cn(
                      "px-1 py-1.5 text-center w-[50px] font-medium",
                      player.isActive && "bg-blue-500/80 dark:bg-blue-600/80"
                    )}
                  >
                    {player.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {/* Upper Section Header */}
              <tr className="bg-gradient-to-r from-blue-50/70 to-blue-50/50 dark:from-blue-900/20 dark:to-blue-900/10 font-medium">
                <td colSpan={players.length + 1} className="px-2 py-1 text-left text-[10px] font-medium text-blue-800 dark:text-blue-300">
                  Upper Section
                </td>
              </tr>
              
              {/* Upper Section Rows */}
              {availableUpperSection.map(category => (
                <tr key={category.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60">
                  <td className="px-2 py-1 text-left border-b border-zinc-200/70 dark:border-zinc-800/70 font-medium text-[10px] text-zinc-700 dark:text-zinc-300">
                    {category.label}
                  </td>
                  {players.map(player => (
                    <td 
                      key={`${player.id}-${category.id}`}
                      className={cn(
                        "border-b border-zinc-200/70 dark:border-zinc-800/70 text-center px-1 py-1 text-xs",
                        player.id === currentPlayerId && "bg-blue-50/60 dark:bg-blue-900/10",
                        player.id === currentPlayerId && player.scoreCard[category.id] === null && currentDice.length === 6 && 
                          "cursor-pointer hover:bg-blue-100/80 dark:hover:bg-blue-900/40 transition-colors duration-150 rounded-md",
                        player.scoreCard[category.id] !== null && "text-zinc-900 dark:text-zinc-100 font-medium"
                      )}
                      onClick={() => {
                        const isSelectable = player.id === currentPlayerId && player.scoreCard[category.id] === null && currentDice.length === 6;
                        if (isSelectable && onScoreSelect) {
                          onScoreSelect(category.id);
                        }
                      }}
                    >
                      {player.scoreCard[category.id] !== null ? (
                        <span>{player.scoreCard[category.id]}</span>
                      ) : (
                        player.id === currentPlayerId && currentDice.length === 6 ? (
                          <span className="text-blue-600 dark:text-blue-400 font-medium text-[10px]">{potentialScores[category.id]}</span>
                        ) : null
                      )}
                    </td>
                  ))}
                </tr>
              ))}

              {/* Upper Section Subtotal & Bonus */}
              <tr className="bg-blue-50/90 dark:bg-blue-900/30">
                <td className="px-2 py-1 text-left border-b border-zinc-200/70 dark:border-zinc-800/70 font-medium text-[10px] text-blue-800 dark:text-blue-300">
                  Subtotal
                </td>
                {players.map(player => (
                  <td key={player.id} className="border-b border-zinc-200/70 dark:border-zinc-800/70 text-center px-1 py-1 font-medium text-[10px] text-blue-700 dark:text-blue-400">
                    {calculateUpperSectionSubtotal(player.scoreCard)}
                  </td>
                ))}
              </tr>
              
              <tr className="bg-blue-50/90 dark:bg-blue-900/30">
                <td className="px-2 py-1 text-left border-b-2 border-zinc-200/70 dark:border-zinc-800/70 font-medium text-[10px] text-blue-800 dark:text-blue-300">
                  Bonus (≥84)
                </td>
                {players.map(player => (
                  <td key={player.id} className="border-b-2 border-zinc-200/70 dark:border-zinc-800/70 text-center px-1 py-1 font-medium text-[10px] text-blue-700 dark:text-blue-400">
                    {calculateUpperSectionBonus(player.scoreCard)}
                  </td>
                ))}
              </tr>
              
              {/* Lower Section Header */}
              <tr className="bg-gradient-to-r from-blue-50/70 to-blue-50/50 dark:from-blue-900/20 dark:to-blue-900/10 font-medium">
                <td colSpan={players.length + 1} className="px-2 py-1 text-left text-[10px] font-medium text-blue-800 dark:text-blue-300">
                  Lower Section
                </td>
              </tr>
              
              {/* Lower Section Rows */}
              {availableLowerSection.map(category => (
                <tr key={category.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60">
                  <td className="px-2 py-1 text-left border-b border-zinc-200/70 dark:border-zinc-800/70 font-medium text-[10px] text-zinc-700 dark:text-zinc-300">
                    {category.label}
                  </td>
                  {players.map(player => (
                    <td 
                      key={`${player.id}-${category.id}`}
                      className={cn(
                        "border-b border-zinc-200/70 dark:border-zinc-800/70 text-center px-1 py-1 text-xs",
                        player.id === currentPlayerId && "bg-blue-50/60 dark:bg-blue-900/10",
                        player.id === currentPlayerId && player.scoreCard[category.id] === null && currentDice.length === 6 && 
                          "cursor-pointer hover:bg-blue-100/80 dark:hover:bg-blue-900/40 transition-colors duration-150 rounded-md",
                        player.scoreCard[category.id] !== null && "text-zinc-900 dark:text-zinc-100 font-medium"
                      )}
                      onClick={() => {
                        const isSelectable = player.id === currentPlayerId && player.scoreCard[category.id] === null && currentDice.length === 6;
                        if (isSelectable && onScoreSelect) {
                          onScoreSelect(category.id);
                        }
                      }}
                    >
                      {player.scoreCard[category.id] !== null ? (
                        <span>{player.scoreCard[category.id]}</span>
                      ) : (
                        player.id === currentPlayerId && currentDice.length === 6 ? (
                          <span className="text-blue-600 dark:text-blue-400 font-medium text-[10px]">{potentialScores[category.id]}</span>
                        ) : null
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              {/* Total - Always visible at bottom */}
              <tr className="bg-gradient-to-r from-blue-600/95 to-blue-500/95 dark:from-blue-700/95 dark:to-blue-600/95 sticky bottom-0 z-20">
                <td className="px-2 py-1.5 text-left font-semibold text-white">
                  Total
                </td>
                {players.map(player => (
                  <td key={player.id} className="text-center px-1 py-1.5 font-semibold text-white">
                    {calculateTotal(player.scoreCard)}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ScoreCard 