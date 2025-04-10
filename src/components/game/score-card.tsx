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
          "border border-amber-800/30 text-center py-0.5 px-1 text-sm",
          isCurrentPlayersTurn && "bg-amber-100/20",
          isSelectable && "cursor-pointer hover:bg-amber-500/20",
          score !== null && "text-amber-900 font-medium"
        )}
        onClick={() => isSelectable && onScoreSelect && onScoreSelect(category)}
      >
        {score !== null ? (
          <span>{score}</span>
        ) : (
          isSelectable && potentialScore !== undefined ? (
            <span className="text-amber-600 opacity-70">{potentialScore}</span>
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
    <div className="w-full h-full">
      <div className="overflow-x-auto w-full h-full">
        <table className="w-full h-full border-collapse bg-amber-50 overflow-hidden shadow-sm text-xs table-fixed">
          <thead className="sticky top-0 z-10">
            <tr className="bg-amber-800 text-white">
              <th className="px-1 py-0.5 text-left border border-amber-700 w-[30%]">Category</th>
              {players.map(player => (
                <th 
                  key={player.id} 
                  className={cn(
                    "px-1 py-0.5 text-center border border-amber-700",
                    player.isActive && "bg-amber-600"
                  )}
                >
                  {player.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-800/20">
            {/* Upper Section - Removed heading */}
            
            {availableUpperSection.map(category => (
              <tr key={category.id} className="hover:bg-amber-100">
                <td className="px-1 py-0.5 text-left border-l border-r border-amber-800/30 font-medium text-xs truncate">
                  {category.label}
                </td>
                {players.map(player => (
                  <td 
                    key={`${player.id}-${category.id}`}
                    className={cn(
                      "border-l border-r border-amber-800/30 text-center px-1 py-2",
                      player.id === currentPlayerId && "bg-amber-100/20",
                      player.id === currentPlayerId && player.scoreCard[category.id] === null && currentDice.length === 6 && 
                        "cursor-pointer hover:bg-amber-500/20 ring-1 ring-amber-500/40 min-h-[40px]",
                      player.scoreCard[category.id] !== null && "text-amber-900 font-medium"
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
                        <span className="text-amber-600 font-medium text-xs">{potentialScores[category.id]}</span>
                      ) : null
                    )}
                  </td>
                ))}
              </tr>
            ))}

            {/* Upper Section Subtotal */}
            <tr className="bg-amber-100">
              <td className="px-1 py-0.5 text-left border-l border-r border-amber-800/30 font-medium text-xs">
                Subtotal
              </td>
              {players.map(player => (
                <td key={player.id} className="border-l border-r border-amber-800/30 text-center px-1 py-0.5 font-medium text-xs">
                  {calculateUpperSectionSubtotal(player.scoreCard)}
                </td>
              ))}
            </tr>
            
            {/* Bonus */}
            <tr className="bg-amber-100">
              <td className="px-1 py-0.5 text-left border-l border-r border-amber-800/30 font-medium text-xs">
                Bonus
              </td>
              {players.map(player => (
                <td key={player.id} className="border-l border-r border-amber-800/30 border-b-2 border-b-amber-800/60 text-center px-1 py-0.5 font-medium text-xs">
                  {calculateUpperSectionBonus(player.scoreCard)}
                </td>
              ))}
            </tr>
            
            {/* Lower Section - Removed heading */}
            
            {availableLowerSection.map(category => (
              <tr key={category.id} className="hover:bg-amber-100">
                <td className="px-1 py-0.5 text-left border-l border-r border-amber-800/30 font-medium text-xs truncate">
                  {category.label}
                </td>
                {players.map(player => (
                  <td 
                    key={`${player.id}-${category.id}`}
                    className={cn(
                      "border-l border-r border-amber-800/30 text-center px-1 py-2",
                      player.id === currentPlayerId && "bg-amber-100/20",
                      player.id === currentPlayerId && player.scoreCard[category.id] === null && currentDice.length === 6 && 
                        "cursor-pointer hover:bg-amber-500/20 ring-1 ring-amber-500/40 min-h-[40px]",
                      player.scoreCard[category.id] !== null && "text-amber-900 font-medium"
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
                        <span className="text-amber-600 font-medium text-xs">{potentialScores[category.id]}</span>
                      ) : null
                    )}
                  </td>
                ))}
              </tr>
            ))}
            
            {/* Total */}
            <tr className="bg-amber-500/80 sticky bottom-0 z-10">
              <td className="px-1 py-0.5 text-left border-l border-r border-amber-800/30 font-bold text-xs">
                Total
              </td>
              {players.map(player => (
                <td key={player.id} className="border-l border-r border-amber-800/30 text-center px-1 py-0.5 font-bold text-xs">
                  {calculateTotal(player.scoreCard)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScoreCard; 