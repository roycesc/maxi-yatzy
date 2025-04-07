import { rollDice, rerollDice } from '@/lib/game/dice';
import {
  calculatePotentialScores,
  calculateUpperSectionBonus,
} from '@/lib/game/scoring';

// Types for our simulation
type ScoreCard = Record<string, number | null>;
type Player = {
  name: string;
  scoreCard: ScoreCard;
};

/**
 * Simulates a complete game of Maxi Yatzy with the given number of players
 */
const simulateMaxiYatzyGame = (numPlayers: number): Player[] => {
  // Initialize players with empty score cards
  const players: Player[] = [];
  for (let i = 0; i < numPlayers; i++) {
    players.push({
      name: `Player ${i + 1}`,
      scoreCard: {
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
        maxiYatzy: null,
      },
    });
  }

  // A game consists of each player taking 20 turns (one for each category)
  // In our simulation, we'll decide which category to fill based on the highest potential score
  const rounds = 20; // 20 categories to fill

  for (let round = 0; round < rounds; round++) {
    for (let playerIndex = 0; playerIndex < numPlayers; playerIndex++) {
      const player = players[playerIndex];
      
      // Simulate a turn
      // 1. Automatic first roll
      let dice = rollDice(6);
      
      // 2. Choose dice to hold after first roll (simulate strategy)
      let heldIndices = getStrategicHoldIndices(dice, player.scoreCard);
      
      // 3. Second roll
      dice = rerollDice(dice, heldIndices);
      
      // 4. Choose dice to hold after second roll
      heldIndices = getStrategicHoldIndices(dice, player.scoreCard);
      
      // 5. Final roll
      dice = rerollDice(dice, heldIndices);
      
      // 6. Choose category to score based on highest potential points
      const potentialScores = calculatePotentialScores(dice);
      const categoryToScore = getBestAvailableCategory(potentialScores, player.scoreCard);
      
      // 7. Update player's score card
      player.scoreCard[categoryToScore] = potentialScores[categoryToScore];
    }
  }

  // Calculate upper section bonuses
  players.forEach(player => {
    const upperSection = {
      ones: player.scoreCard.ones,
      twos: player.scoreCard.twos, 
      threes: player.scoreCard.threes,
      fours: player.scoreCard.fours,
      fives: player.scoreCard.fives,
      sixes: player.scoreCard.sixes
    };
    
    // Add bonus to total but don't store in scorecard (it's calculated, not a category)
    const bonus = calculateUpperSectionBonus(upperSection);
    player.scoreCard.bonus = bonus;
  });

  return players;
};

/**
 * Simple strategy to decide which dice to hold
 * In a real implementation, this would be much more sophisticated
 */
const getStrategicHoldIndices = (
  dice: number[],
  scoreCard: ScoreCard
): number[] => {
  const heldIndices: number[] = [];
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  
  // Count occurrences of each die value
  dice.forEach((die, index) => {
    counts[die]++;
  });
  
  // Simple strategy: hold the most frequent dice
  let maxCount = 0;
  let maxValue = 0;
  
  for (let value = 1; value <= 6; value++) {
    if (counts[value] > maxCount) {
      maxCount = counts[value];
      maxValue = value;
    }
  }
  
  // Hold all dice with the most frequent value
  if (maxCount >= 2) { // Only hold if we have at least a pair
    dice.forEach((die, index) => {
      if (die === maxValue) {
        heldIndices.push(index);
      }
    });
  }
  
  return heldIndices;
};

/**
 * Find the best available category to score based on potential scores
 */
const getBestAvailableCategory = (
  potentialScores: Record<string, number>,
  scoreCard: ScoreCard
): string => {
  let bestCategory = '';
  let bestScore = -1;
  
  // Find category with highest potential score that hasn't been filled yet
  for (const [category, score] of Object.entries(potentialScores)) {
    if (scoreCard[category] === null && score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }
  
  // If all categories with points are filled, choose the first empty one
  if (bestCategory === '') {
    for (const [category, score] of Object.entries(scoreCard)) {
      if (score === null && category !== 'bonus') {
        bestCategory = category;
        break;
      }
    }
  }
  
  return bestCategory;
};

/**
 * Calculate total score for a player
 */
const calculateTotalScore = (scoreCard: ScoreCard): number => {
  return Object.values(scoreCard).reduce(
    (sum: number, score) => sum + (score ?? 0),
    0
  );
};

/**
 * Find the winner from list of players
 */
const determineWinner = (players: Player[]): Player => {
  return players.reduce((winner, player) => {
    const winnerScore = calculateTotalScore(winner.scoreCard);
    const playerScore = calculateTotalScore(player.scoreCard);
    return playerScore > winnerScore ? player : winner;
  }, players[0]);
};

describe('Maxi Yatzy Game Simulation', () => {
  test('should complete a game with 2 players', () => {
    const players = simulateMaxiYatzyGame(2);
    
    // Verify all categories are filled
    players.forEach(player => {
      Object.entries(player.scoreCard).forEach(([category, score]) => {
        if (category !== 'bonus') {
          expect(score).not.toBeNull();
        }
      });
    });
    
    // Determine winner
    const winner = determineWinner(players);
    
    // Log results
    console.log(`2 Players Game - Winner: ${winner.name} with score: ${calculateTotalScore(winner.scoreCard)}`);
    
    expect(players.length).toBe(2);
  });
  
  test('should complete a game with 3 players', () => {
    const players = simulateMaxiYatzyGame(3);
    
    // Verify all categories are filled
    players.forEach(player => {
      Object.entries(player.scoreCard).forEach(([category, score]) => {
        if (category !== 'bonus') {
          expect(score).not.toBeNull();
        }
      });
    });
    
    // Determine winner
    const winner = determineWinner(players);
    
    // Log results
    console.log(`3 Players Game - Winner: ${winner.name} with score: ${calculateTotalScore(winner.scoreCard)}`);
    
    expect(players.length).toBe(3);
  });
  
  test('should complete a game with 4 players', () => {
    const players = simulateMaxiYatzyGame(4);
    
    // Verify all categories are filled
    players.forEach(player => {
      Object.entries(player.scoreCard).forEach(([category, score]) => {
        if (category !== 'bonus') {
          expect(score).not.toBeNull();
        }
      });
    });
    
    // Determine winner
    const winner = determineWinner(players);
    
    // Log results
    console.log(`4 Players Game - Winner: ${winner.name} with score: ${calculateTotalScore(winner.scoreCard)}`);
    
    expect(players.length).toBe(4);
  });
}); 