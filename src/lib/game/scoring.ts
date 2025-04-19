/**
 * Scoring utilities for Maxi Yatzy game.
 * Maxi Yatzy has specific scoring categories based on 6 dice.
 */

/**
 * Counts the occurrences of each die face value.
 * @param dice An array of numbers representing the dice roll.
 * @returns An object mapping die face value (1-6) to its count.
 */
const getDiceCounts = (dice: number[]): Record<number, number> => {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (const die of dice) {
    if (die >= 1 && die <= 6) {
      counts[die]++;
    }
  }
  return counts;
};

/**
 * Get pairs found in the dice roll, sorted by value (descending).
 * @param dice An array of numbers representing the dice roll.
 * @returns Array of die values that appear as pairs, sorted descending.
 */
const getPairs = (dice: number[]): number[] => {
  const counts = getDiceCounts(dice);
  const pairs: number[] = [];
  
  for (let value = 6; value >= 1; value--) {
    if (counts[value] >= 2) {
      pairs.push(value);
    }
  }
  
  return pairs;
};

/**
 * Get values that appear at least n times in the dice roll, sorted by value (descending).
 * @param dice An array of numbers representing the dice roll.
 * @param n The minimum count required
 * @returns Array of die values that appear at least n times, sorted descending.
 */
const getValuesWithMinCount = (dice: number[], n: number): number[] => {
  const counts = getDiceCounts(dice);
  const values: number[] = [];
  
  for (let value = 6; value >= 1; value--) {
    if (counts[value] >= n) {
      values.push(value);
    }
  }
  
  return values;
};

// Upper Section Scoring Functions

/**
 * Calculates the score for upper section categories (Ones through Sixes).
 * @param dice An array of numbers representing the dice roll.
 * @param value The target die face value (1-6).
 * @returns The sum of dice matching the target value.
 */
export const calculateSingles = (dice: number[], value: number): number => {
  if (value < 1 || value > 6) return 0;
  return dice.reduce((sum, die) => (die === value ? sum + die : sum), 0);
};

/**
 * Calculates the upper section bonus.
 * @param upperScores An object containing scores for Ones through Sixes.
 * @returns 50 if the total score is 63 or more, otherwise 0.
 */
export const calculateUpperSectionBonus = (
  upperScores: Record<string, number | null>
): number => {
  const total = Object.values(upperScores).reduce(
    (sum: number, score) => sum + (score ?? 0),
    0
  );
  return total >= 63 ? 50 : 0;
};

// Lower Section Scoring Functions

/**
 * Calculates the score for One Pair.
 * @param dice An array of numbers representing the dice roll.
 * @returns Sum of the highest pair, or 0 if no pair exists.
 */
export const calculateOnePair = (dice: number[]): number => {
  const pairs = getPairs(dice);
  return pairs.length > 0 ? pairs[0] * 2 : 0;
};

/**
 * Calculates the score for Two Pairs.
 * @param dice An array of numbers representing the dice roll.
 * @returns Sum of the two highest pairs, or 0 if fewer than two pairs exist.
 */
export const calculateTwoPairs = (dice: number[]): number => {
  const pairs = getPairs(dice);
  if (pairs.length >= 2) {
    return pairs[0] * 2 + pairs[1] * 2;
  }
  return 0;
};

/**
 * Calculates the score for Three Pairs.
 * @param dice An array of numbers representing the dice roll.
 * @returns Sum of all dice if exactly three different pairs exist, otherwise 0.
 */
export const calculateThreePairs = (dice: number[]): number => {
  const pairs = getPairs(dice);
  
  // Check if we have exactly 3 different pairs
  // This requires all 6 dice to be part of a pair
  if (pairs.length >= 3) {
    // First make sure we're not counting triples as more than one pair
    const counts = getDiceCounts(dice);
    let pairCount = 0;
    let totalDiceInPairs = 0;
    
    for (let value = 6; value >= 1; value--) {
      // Each pair uses exactly 2 dice
      const pairsOfThisValue = Math.floor(counts[value] / 2);
      pairCount += pairsOfThisValue;
      totalDiceInPairs += pairsOfThisValue * 2;
    }
    
    // All dice must be used in pairs, and there must be exactly 3 pairs
    if (pairCount === 3 && totalDiceInPairs === 6) {
      return dice.reduce((sum, die) => sum + die, 0);
    }
  }
  
  return 0;
};

/**
 * Calculates the score for Three of a Kind.
 * @param dice An array of numbers representing the dice roll.
 * @returns Sum of the highest three of a kind, or 0 if no three of a kind exists.
 */
export const calculateThreeOfAKind = (dice: number[]): number => {
  const threeOfAKind = getValuesWithMinCount(dice, 3);
  return threeOfAKind.length > 0 ? threeOfAKind[0] * 3 : 0;
};

/**
 * Calculates the score for Four of a Kind.
 * @param dice An array of numbers representing the dice roll.
 * @returns Sum of the highest four of a kind, or 0 if no four of a kind exists.
 */
export const calculateFourOfAKind = (dice: number[]): number => {
  const fourOfAKind = getValuesWithMinCount(dice, 4);
  return fourOfAKind.length > 0 ? fourOfAKind[0] * 4 : 0;
};

/**
 * Calculates the score for Five of a Kind.
 * @param dice An array of numbers representing the dice roll.
 * @returns Sum of the five of a kind, or 0 if no five of a kind exists.
 */
export const calculateFiveOfAKind = (dice: number[]): number => {
  const fiveOfAKind = getValuesWithMinCount(dice, 5);
  return fiveOfAKind.length > 0 ? fiveOfAKind[0] * 5 : 0;
};

/**
 * Calculates the score for a Small Straight (1-2-3-4-5).
 * @param dice An array of numbers representing the dice roll.
 * @returns 15 if the small straight exists, otherwise 0.
 */
export const calculateSmallStraight = (dice: number[]): number => {
  const uniqueDice = new Set(dice);
  const required = [1, 2, 3, 4, 5];
  return required.every((value) => uniqueDice.has(value)) ? 15 : 0;
};

/**
 * Calculates the score for a Large Straight (2-3-4-5-6).
 * @param dice An array of numbers representing the dice roll.
 * @returns 20 if the large straight exists, otherwise 0.
 */
export const calculateLargeStraight = (dice: number[]): number => {
  const uniqueDice = new Set(dice);
  const required = [2, 3, 4, 5, 6];
  return required.every((value) => uniqueDice.has(value)) ? 20 : 0;
};

/**
 * Calculates the score for a Full Straight (1-2-3-4-5-6).
 * @param dice An array of numbers representing the dice roll.
 * @returns 21 if the full straight exists, otherwise 0.
 */
export const calculateFullStraight = (dice: number[]): number => {
  const uniqueDice = new Set(dice);
  const required = [1, 2, 3, 4, 5, 6];
  return required.every((value) => uniqueDice.has(value)) ? 21 : 0;
};

/**
 * Calculates the score for a Full House (Three of a kind and a pair).
 * @param dice An array of numbers representing the dice roll.
 * @returns Sum of all five dice used in the full house, or 0 if no full house exists.
 */
export const calculateFullHouse = (dice: number[]): number => {
  const counts = getDiceCounts(dice);
  // Look for any triple and a suitable pair (same value if >=5, or a different value)
  for (let threeVal = 6; threeVal >= 1; threeVal--) {
    if (counts[threeVal] >= 3) {
      for (let pairVal = 6; pairVal >= 1; pairVal--) {
        if ((pairVal !== threeVal && counts[pairVal] >= 2) ||
            (pairVal === threeVal && counts[threeVal] >= 5)) {
          // Full house matched: sum only the triple and pair
          return threeVal * 3 + pairVal * 2;
        }
      }
    }
  }
  return 0;
};

/**
 * Calculates the score for a Villa (House) (Two sets of three of a kind).
 * @param dice An array of numbers representing the dice roll.
 * @returns Sum of all six dice if a villa exists, otherwise 0.
 */
export const calculateVilla = (dice: number[]): number => {
  const counts = getDiceCounts(dice);
  const threeOfAKindValues: number[] = [];

  // Find all values that appear at least 3 times
  for (let value = 6; value >= 1; value--) {
    if (counts[value] >= 3) {
      threeOfAKindValues.push(value);
    }
  }

  // Need exactly two different values with three of each
  if (threeOfAKindValues.length === 2 && threeOfAKindValues[0] !== threeOfAKindValues[1]) {
    return dice.reduce((sum, die) => sum + die, 0);
  }

  return 0;
};

/**
 * Calculates the score for a Tower (Four of a kind + a pair).
 * @param dice An array of numbers representing the dice roll.
 * @returns Sum of all six dice if a tower exists, otherwise 0.
 */
export const calculateTower = (dice: number[]): number => {
  const counts = getDiceCounts(dice);
  let foundFourOfAKind = false;
  let foundPair = false;
  let fourOfAKindValue = 0;
  let pairValue = 0;

  // Find the four of a kind
  for (let value = 6; value >= 1; value--) {
    if (counts[value] >= 4) {
      foundFourOfAKind = true;
      fourOfAKindValue = value;
      break;
    }
  }

  // If found four of a kind, look for a pair
  if (foundFourOfAKind) {
    for (let value = 6; value >= 1; value--) {
      if (value !== fourOfAKindValue && counts[value] >= 2) {
        foundPair = true;
        pairValue = value;
        break;
      }
    }
  }

  // Tower requires four of a kind and a different pair
  if (foundFourOfAKind && foundPair) {
    return dice.reduce((sum, die) => sum + die, 0);
  }

  return 0;
};

/**
 * Calculates the score for Chance (sum of all dice).
 * @param dice An array of numbers representing the dice roll.
 * @returns Sum of all dice.
 */
export const calculateChance = (dice: number[]): number => {
  return dice.reduce((sum, die) => sum + die, 0);
};

/**
 * Calculates the score for Maxi Yatzy (all six dice the same).
 * @param dice An array of numbers representing the dice roll.
 * @returns 100 if all six dice are the same, otherwise 0.
 */
export const calculateMaxiYatzy = (dice: number[]): number => {
  const counts = getDiceCounts(dice);
  for (let value = 1; value <= 6; value++) {
    if (counts[value] === 6) {
      return 100;
    }
  }
  return 0;
};

// Alias for calculateYatzy
export const calculateYatzy = calculateMaxiYatzy;

/**
 * Calculates all potential scores for a dice roll.
 * @param dice An array of numbers representing the dice roll.
 * @returns Object with all possible category scores for the given dice.
 */
export const calculatePotentialScores = (
  dice: number[]
): Record<string, number> => {
  return {
    ones: calculateSingles(dice, 1),
    twos: calculateSingles(dice, 2),
    threes: calculateSingles(dice, 3),
    fours: calculateSingles(dice, 4),
    fives: calculateSingles(dice, 5),
    sixes: calculateSingles(dice, 6),
    onePair: calculateOnePair(dice),
    twoPairs: calculateTwoPairs(dice),
    threePairs: calculateThreePairs(dice),
    threeOfAKind: calculateThreeOfAKind(dice),
    fourOfAKind: calculateFourOfAKind(dice),
    fiveOfAKind: calculateFiveOfAKind(dice),
    smallStraight: calculateSmallStraight(dice),
    largeStraight: calculateLargeStraight(dice),
    fullStraight: calculateFullStraight(dice),
    fullHouse: calculateFullHouse(dice),
    villa: calculateVilla(dice),
    tower: calculateTower(dice),
    chance: calculateChance(dice),
    maxiYatzy: calculateMaxiYatzy(dice),
  };
};

/**
 * Generic N-of-a-kind calculator (2=Pair, 3=Three of a kind, etc.)
 */
export const calculateNOfAKind = (dice: number[], n: number): number => {
  switch (n) {
    case 2:
      return calculateOnePair(dice);
    case 3:
      return calculateThreeOfAKind(dice);
    case 4:
      return calculateFourOfAKind(dice);
    case 5:
      return calculateFiveOfAKind(dice);
    default:
      return 0;
  }
};

// --- Turn Progression Logic (Conceptual) ---
// Actual turn progression (like tracking rolls remaining) is typically managed
// as part of the game state (e.g., in the database or server-side memory)
// rather than standalone functions here. It involves knowing the current
// player's state within their turn.

// Example Check (would live within game state logic):
// const MAX_ROLLS_PER_TURN = 3;
// function canRollAgain(rollsTaken: number): boolean {
//   return rollsTaken < MAX_ROLLS_PER_TURN;
// } 