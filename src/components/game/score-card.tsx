'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
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
} from "@/components/ui/alert-dialog"

// Add mobile touch detection
const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

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
  { id: 'ones', label: 'Ones', index: 0 },
  { id: 'twos', label: 'Twos', index: 1 },
  { id: 'threes', label: 'Threes', index: 2 },
  { id: 'fours', label: 'Fours', index: 3 },
  { id: 'fives', label: 'Fives', index: 4 },
  { id: 'sixes', label: 'Sixes', index: 5 },
];

const LOWER_SECTION = [
  { id: 'onePair', label: 'One Pair', index: 6 },
  { id: 'twoPairs', label: 'Two Pairs', index: 7 },
  { id: 'threePairs', label: 'Three Pairs', index: 8 },
  { id: 'threeOfAKind', label: 'Three of a Kind', index: 9 },
  { id: 'fourOfAKind', label: 'Four of a Kind', index: 10 },
  { id: 'fiveOfAKind', label: 'Five of a Kind', index: 11 },
  { id: 'smallStraight', label: 'Small Straight', index: 12 },
  { id: 'largeStraight', label: 'Large Straight', index: 13 },
  { id: 'fullStraight', label: 'Full Straight', index: 14 },
  { id: 'fullHouse', label: 'Full House', index: 15 },
  { id: 'villa', label: 'Villa', index: 16 },
  { id: 'tower', label: 'Tower', index: 17 },
  { id: 'chance', label: 'Chance', index: 18 },
  { id: 'maxiYatzy', label: 'Maxi Yatzy', index: 19 },
];

// Component for call-out button
const CallOutButton: React.FC<{
  onClick: () => void;
  position: 'left' | 'right';
  value: number;
  isActive: boolean;
  isPotentiallyZero: boolean;
}> = ({ onClick, position, value, isActive, isPotentiallyZero }) => {
  if (!isActive) return null;
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Line connecting button to cell */}
      <div 
        className={cn(
          "absolute top-1/2 h-0.5",
          position === 'left' ? "right-full w-3" : "left-full w-3",
          isPotentiallyZero ? "bg-red-300" : "bg-main-blue/30"
        )} 
      />
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 z-10 pointer-events-auto",
          "w-12 h-12 flex items-center justify-center",
          isPotentiallyZero 
            ? "bg-red-50 hover:bg-red-100 active:bg-red-200 border-red-200" 
            : "bg-main-blue/15 hover:bg-main-blue/25 active:bg-main-blue/40 border-main-blue/20",
          "rounded-full shadow-md border",
          "touch-manipulation transition-colors duration-150",
          position === 'left' ? "-left-14" : "-right-14"
        )}
        aria-label={`Select score ${value}`}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <span 
            className={cn(
              "absolute text-base font-semibold",
              isPotentiallyZero ? "text-red-500" : "text-main-blue"
            )}
          >
            {value}
          </span>
        </div>
      </button>
    </div>
  );
};

// Component for cell highlight to indicate selectability
const SelectableHighlight: React.FC<{
  isActive: boolean;
  isPotentiallyZero: boolean;
  isFocused?: boolean;
}> = ({ isActive, isPotentiallyZero, isFocused = false }) => {
  if (!isActive) return null;
  
  return (
    <div 
      className={cn(
        "absolute inset-0 pointer-events-none",
        isPotentiallyZero 
          ? "bg-red-50/40 border border-red-200/50" 
          : "bg-main-blue/5 border border-main-blue/30",
        isFocused && "bg-main-blue/10",
        "rounded-md transition-colors duration-150"
      )}
    />
  );
};

const ScoreCard: React.FC<ScoreCardProps> = ({
  players,
  currentDice = [],
  onScoreSelect,
  currentPlayerId,
}) => {
  // State for the zero score confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // State to track which cell is currently focused (for showing callout buttons)
  const [focusedCell, setFocusedCell] = useState<{playerId: string, categoryId: string} | null>(null);
  
  // Detect if we're on a touch device for better mobile experience
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  // Additional state to detect if we're on a tablet
  const [isTablet, setIsTablet] = useState(false);
  
  // Ref for table container to help with responsive positioning
  const tableContainerRef = useRef<HTMLDivElement>(null);
  
  // Detect touch devices and screen size on mount
  useEffect(() => {
    const checkDeviceType = () => {
      setIsMobileDevice(isTouchDevice());
      // Consider tablets to be devices with width between 640px and 1024px
      setIsTablet(window.innerWidth >= 640 && window.innerWidth <= 1024);
    };
    
    checkDeviceType();
    
    // Also listen for resize events to update tablet status
    window.addEventListener('resize', checkDeviceType);
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);
  
  // Close focused cell when clicking outside the table
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tableContainerRef.current && !tableContainerRef.current.contains(e.target as Node)) {
        setFocusedCell(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const potentialScores = currentDice.length === 6 
    ? calculatePotentialScores(currentDice) 
    : {};
  
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  
  const handleCellFocus = (playerId: string, categoryId: string) => {
    setFocusedCell({ playerId, categoryId });
  };
  
  // Determine button position (alternating left/right based on category index)
  const getButtonPosition = (categoryId: string): 'left' | 'right' => {
    // Find the category from our known lists
    const upperCategory = UPPER_SECTION.find(c => c.id === categoryId);
    const lowerCategory = LOWER_SECTION.find(c => c.id === categoryId);
    
    // Get the index from the found category
    const index = upperCategory?.index ?? lowerCategory?.index ?? 0;
    
    // Alternate based on whether index is even or odd
    return index % 2 === 0 ? 'left' : 'right';
  };
  
  const handleCategorySelect = (category: string) => {
    const potential = potentialScores[category];
    
    // If potential score is 0 but there could be a positive score option,
    // show confirmation dialog
    if (potential === 0 && hasPositiveScoreOptions()) {
      setSelectedCategory(category);
      setConfirmDialogOpen(true);
    } else {
      // Otherwise just select the score
      if (onScoreSelect) {
        onScoreSelect(category);
      }
    }
  };
  
  const hasPositiveScoreOptions = () => {
    // Check if any category could have a positive score
    return Object.values(potentialScores).some(score => score > 0);
  };
  
  const confirmZeroScore = () => {
    if (selectedCategory && onScoreSelect) {
      onScoreSelect(selectedCategory);
      setConfirmDialogOpen(false);
      setSelectedCategory(null);
    }
  };
  
  const cancelZeroScore = () => {
    setConfirmDialogOpen(false);
    setSelectedCategory(null);
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

  const availableUpperSection = UPPER_SECTION;
  const availableLowerSection = LOWER_SECTION;

  return (
    <>
      <div className="w-full h-full flex flex-col px-2 py-0.5">
        <div className="overflow-auto rounded-2xl border border-main-blue/20 shadow-sm h-full flex flex-col">
          <div className="min-w-max" ref={tableContainerRef}> {/* Prevents table from shrinking smaller than content */}
            <table className="w-full border-collapse bg-white text-xs">
              <thead className="sticky top-0 z-20">
                <tr className="bg-main-blue text-white">
                  <th className="px-2 py-1.5 text-left font-medium border-r border-main-blue/30 w-[90px]">
                    Category
                  </th>
                  {players.map(player => (
                    <th 
                      key={player.id} 
                      className={cn(
                        "px-1 py-1.5 text-center w-[50px] font-medium",
                        player.isActive && "bg-accent-orange text-white"
                      )}
                    >
                      {player.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* Upper Section Header */}
                <tr className="bg-main-blue/10 font-medium">
                  <td colSpan={players.length + 1} className="px-2 py-1 text-left text-[10px] font-medium text-main-blue">
                    Upper Section
                  </td>
                </tr>
                
                {/* Upper Section Rows */}
                {availableUpperSection.map(category => (
                  <tr key={category.id} className="hover:bg-accent-orange/5">
                    <td className="px-2 py-1 text-left border-b border-gray-200/70 font-medium text-[10px] text-gray-700">
                      {category.label}
                    </td>
                    {players.map(player => {
                      const isSelectable = player.id === currentPlayerId && 
                                           player.scoreCard[category.id] === null && 
                                           currentDice.length === 6;
                      const isPotentiallyZero = isSelectable && (potentialScores[category.id] === 0);
                      const isCellFocused = focusedCell?.playerId === player.id && focusedCell?.categoryId === category.id;
                      const shouldShowCallout = isSelectable && (
                        isMobileDevice || 
                        isTablet || 
                        isCellFocused
                      );
                      const buttonPosition = getButtonPosition(category.id);
                      
                      return (
                        <td 
                          key={`${player.id}-${category.id}`}
                          className={cn(
                            "border-b border-gray-200/70 text-center px-1 py-2 relative", // Increased padding for better touch area
                            player.id === currentPlayerId && "bg-main-blue/5",
                            isSelectable && "cursor-pointer transition-colors duration-150",
                            player.scoreCard[category.id] !== null && "text-gray-900 font-medium"
                          )}
                          onClick={(e) => {
                            if (isSelectable) {
                              // If the cell is not already focused, just focus it
                              if (!isCellFocused) {
                                e.stopPropagation();
                                handleCellFocus(player.id, category.id);
                              } else {
                                // If already focused, select the category
                                handleCategorySelect(category.id);
                              }
                            }
                          }}
                        >
                          {/* Visual highlight for selectable cells */}
                          <SelectableHighlight 
                            isActive={isSelectable} 
                            isPotentiallyZero={isPotentiallyZero}
                            isFocused={isCellFocused}
                          />
                          
                          {/* Call-out button */}
                          {shouldShowCallout && (
                            <CallOutButton
                              onClick={() => handleCategorySelect(category.id)}
                              position={buttonPosition}
                              value={potentialScores[category.id] || 0}
                              isActive={isSelectable}
                              isPotentiallyZero={isPotentiallyZero}
                            />
                          )}
                          
                          {player.scoreCard[category.id] !== null ? (
                            <span>{player.scoreCard[category.id]}</span>
                          ) : (
                            player.id === currentPlayerId && currentDice.length === 6 ? (
                              <span className={cn(
                                "text-[11px] font-medium", // Slightly increased font size
                                potentialScores[category.id] === 0 ? "text-red-400" : "text-main-blue"
                              )}>
                                {potentialScores[category.id]}
                              </span>
                            ) : null
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Upper Section Subtotal & Bonus */}
                <tr className="bg-main-blue/10">
                  <td className="px-2 py-1 text-left border-b border-gray-200/70 font-medium text-[10px] text-main-blue">
                    Subtotal
                  </td>
                  {players.map(player => (
                    <td key={player.id} className="border-b border-gray-200/70 text-center px-1 py-1 font-medium text-[10px] text-main-blue">
                      {calculateUpperSectionSubtotal(player.scoreCard)}
                    </td>
                  ))}
                </tr>
                
                <tr className="bg-main-blue/10">
                  <td className="px-2 py-1 text-left border-b-2 border-gray-200/70 font-medium text-[10px] text-main-blue">
                    Bonus (≥84)
                  </td>
                  {players.map(player => (
                    <td key={player.id} className="border-b-2 border-gray-200/70 text-center px-1 py-1 font-medium text-[10px] text-main-blue">
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
                    {players.map(player => {
                      const isSelectable = player.id === currentPlayerId && 
                                           player.scoreCard[category.id] === null && 
                                           currentDice.length === 6;
                      const isPotentiallyZero = isSelectable && (potentialScores[category.id] === 0);
                      const isCellFocused = focusedCell?.playerId === player.id && focusedCell?.categoryId === category.id;
                      const shouldShowCallout = isSelectable && (
                        isMobileDevice || 
                        isTablet || 
                        isCellFocused
                      );
                      const buttonPosition = getButtonPosition(category.id);
                      
                      return (
                        <td 
                          key={`${player.id}-${category.id}`}
                          className={cn(
                            "border-b border-zinc-200/70 dark:border-zinc-800/70 text-center px-1 py-2 relative", // Increased padding for better touch
                            player.id === currentPlayerId && "bg-blue-50/60 dark:bg-blue-900/10",
                            isSelectable && "cursor-pointer transition-colors duration-150",
                            player.scoreCard[category.id] !== null && "text-zinc-900 dark:text-zinc-100 font-medium"
                          )}
                          onClick={(e) => {
                            if (isSelectable) {
                              // If the cell is not already focused, just focus it
                              if (!isCellFocused) {
                                e.stopPropagation();
                                handleCellFocus(player.id, category.id);
                              } else {
                                // If already focused, select the category
                                handleCategorySelect(category.id);
                              }
                            }
                          }}
                        >
                          {/* Visual highlight for selectable cells */}
                          <SelectableHighlight 
                            isActive={isSelectable} 
                            isPotentiallyZero={isPotentiallyZero}
                            isFocused={isCellFocused}
                          />
                          
                          {/* Call-out button */}
                          {shouldShowCallout && (
                            <CallOutButton
                              onClick={() => handleCategorySelect(category.id)}
                              position={buttonPosition}
                              value={potentialScores[category.id] || 0}
                              isActive={isSelectable}
                              isPotentiallyZero={isPotentiallyZero}
                            />
                          )}
                          
                          {player.scoreCard[category.id] !== null ? (
                            <span>{player.scoreCard[category.id]}</span>
                          ) : (
                            player.id === currentPlayerId && currentDice.length === 6 ? (
                              <span className={cn(
                                "text-[11px] font-medium", // Slightly increased font size
                                potentialScores[category.id] === 0 ? "text-red-400" : "text-blue-600"
                              )}>
                                {potentialScores[category.id]}
                              </span>
                            ) : null
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {/* Total - Always visible at bottom */}
                <tr className="bg-gradient-to-r from-blue-600/95 to-blue-500/95 dark:from-blue-700/95 dark:to-blue-600/95 sticky bottom-0 z-20">
                  <td className="px-2 py-1.5 text-left font-medium text-xs text-white">
                    Total
                  </td>
                  {players.map(player => (
                    <td key={player.id} className="text-center px-1 py-1.5 font-bold text-xs text-white">
                      {calculateTotal(player.scoreCard)}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
      
      {/* Zero Score Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent className="bg-white rounded-xl border-2 border-main-blue/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-main-blue">
              Confirm Zero Score
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Are you sure you want to enter a zero for this category? 
              You have other scoring options available.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-white border-main-blue/20 text-gray-700 hover:bg-gray-100"
              onClick={cancelZeroScore}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-main-blue text-white hover:bg-main-blue/90 font-medium"
              onClick={confirmZeroScore}
            >
              Enter Zero
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ScoreCard; 