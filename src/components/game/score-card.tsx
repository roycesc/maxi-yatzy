'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { calculatePotentialScores } from '@/lib/game/scoring'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

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
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  
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

  // For filtering categories when showing available-only
  const getAvailableCategories = (section) => {
    if (!showAvailableOnly || !currentPlayer || currentDice.length !== 6) {
      return section;
    }
    
    return section.filter(category => 
      currentPlayer.scoreCard[category.id] === null
    );
  };

  const availableUpperSection = getAvailableCategories(UPPER_SECTION);
  const availableLowerSection = getAvailableCategories(LOWER_SECTION);

  // Check if we have available categories to show
  const hasAvailableCategories = availableUpperSection.length > 0 || availableLowerSection.length > 0;

  return (
    <div className="w-full space-y-4">
      {/* Toggle switch for showing available categories only */}
      <div className="flex items-center justify-end space-x-2 px-2">
        <Switch
          id="show-available"
          checked={showAvailableOnly}
          onCheckedChange={setShowAvailableOnly}
          disabled={!currentPlayer || currentDice.length !== 6}
        />
        <Label htmlFor="show-available" className="text-amber-100">
          Show available categories only
        </Label>
      </div>
      
      <div className="overflow-x-auto w-full">
        {showAvailableOnly && !hasAvailableCategories ? (
          <div className="text-center p-4 bg-amber-50 rounded-lg">
            <p className="text-amber-800">No available categories to fill.</p>
          </div>
        ) : (
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
              {availableUpperSection.length > 0 && (
                <>
                  <tr className="bg-amber-200">
                    <td colSpan={players.length + 1} className="px-3 py-1 font-bold text-amber-900 border border-amber-300">
                      Upper Section
                    </td>
                  </tr>
                  
                  {availableUpperSection.map(category => (
                    <tr key={category.id} className="hover:bg-amber-100">
                      <td className="px-3 py-2 text-left border border-amber-800/30 font-medium">
                        {category.label}
                      </td>
                      {players.map(player => (
                        <td 
                          key={`${player.id}-${category.id}`}
                          className={cn(
                            "border border-amber-800/30 text-center p-2",
                            player.id === currentPlayerId && "bg-amber-100/20",
                            player.id === currentPlayerId && player.scoreCard[category.id] === null && currentDice.length === 6 && 
                              "cursor-pointer hover:bg-amber-500/20 ring-2 ring-amber-500/40",
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
                              <span className="text-amber-600 font-medium">{potentialScores[category.id]}</span>
                            ) : null
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              )}
              
              {!showAvailableOnly && (
                <>
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
                </>
              )}
              
              {/* Lower Section */}
              {availableLowerSection.length > 0 && (
                <>
                  <tr className="bg-amber-200">
                    <td colSpan={players.length + 1} className="px-3 py-1 font-bold text-amber-900 border border-amber-300">
                      Lower Section
                    </td>
                  </tr>
                  
                  {availableLowerSection.map(category => (
                    <tr key={category.id} className="hover:bg-amber-100">
                      <td className="px-3 py-2 text-left border border-amber-800/30 font-medium">
                        {category.label}
                      </td>
                      {players.map(player => (
                        <td 
                          key={`${player.id}-${category.id}`}
                          className={cn(
                            "border border-amber-800/30 text-center p-2",
                            player.id === currentPlayerId && "bg-amber-100/20",
                            player.id === currentPlayerId && player.scoreCard[category.id] === null && currentDice.length === 6 && 
                              "cursor-pointer hover:bg-amber-500/20 ring-2 ring-amber-500/40",
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
                              <span className="text-amber-600 font-medium">{potentialScores[category.id]}</span>
                            ) : null
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              )}
              
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
        )}
      </div>
    </div>
  );
};

export default ScoreCard; 