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
          "border border-amber-800/30 text-center p-2",
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

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full border-collapse bg-amber-50 rounded-lg overflow-hidden shadow-lg">
        <thead>
          <tr className="bg-amber-800 text-white">
            <th className="px-3 py-2 text-left border border-amber-700">Category</th>
            {players.map(player => (
              <th 
                key={player.id} 
                className={cn(
                  "px-3 py-2 text-center min-w-[80px] border border-amber-700",
                  player.isActive && "bg-amber-600"
                )}
              >
                {player.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Upper Section */}
          <tr className="bg-amber-200">
            <td colSpan={players.length + 1} className="px-3 py-1 font-bold text-amber-900 border border-amber-300">
              Upper Section
            </td>
          </tr>
          
          {UPPER_SECTION.map(category => (
            <tr key={category.id} className="hover:bg-amber-100">
              <td className="px-3 py-2 text-left border border-amber-800/30 font-medium">
                {category.label}
              </td>
              {players.map(player => renderScoreCell(player.id, category.id))}
            </tr>
          ))}
          
          {/* Upper Section Subtotal */}
          <tr className="bg-amber-100">
            <td className="px-3 py-2 text-left border border-amber-800/30 font-medium">
              Subtotal
            </td>
            {players.map(player => (
              <td key={player.id} className="border border-amber-800/30 text-center p-2 font-medium">
                {calculateUpperSectionSubtotal(player.scoreCard)}
              </td>
            ))}
          </tr>
          
          {/* Bonus */}
          <tr className="bg-amber-100">
            <td className="px-3 py-2 text-left border border-amber-800/30 font-medium">
              Bonus (if ≥84)
            </td>
            {players.map(player => (
              <td key={player.id} className="border border-amber-800/30 text-center p-2 font-medium">
                {calculateUpperSectionBonus(player.scoreCard)}
              </td>
            ))}
          </tr>
          
          {/* Lower Section */}
          <tr className="bg-amber-200">
            <td colSpan={players.length + 1} className="px-3 py-1 font-bold text-amber-900 border border-amber-300">
              Lower Section
            </td>
          </tr>
          
          {LOWER_SECTION.map(category => (
            <tr key={category.id} className="hover:bg-amber-100">
              <td className="px-3 py-2 text-left border border-amber-800/30 font-medium">
                {category.label}
              </td>
              {players.map(player => renderScoreCell(player.id, category.id))}
            </tr>
          ))}
          
          {/* Total Score */}
          <tr className="bg-amber-300">
            <td className="px-3 py-2 text-left border border-amber-800/30 font-bold">
              Total Score
            </td>
            {players.map(player => (
              <td key={player.id} className="border border-amber-800/30 text-center p-2 font-bold text-amber-900">
                {calculateTotal(player.scoreCard)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ScoreCard; 