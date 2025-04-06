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
  upperScores: Record<string, number | null>,
): number => {
  const total = Object.values(upperScores).reduce(
    (sum: number, score) => sum + (score ?? 0),
    0,
  );
  return total >= 63 ? 50 : 0;
};

/**
 * Calculates the score for N of a Kind (Pair, 3 of a Kind, 4 of a Kind).
 * Finds the highest value N of a Kind present in the dice.
 * Note: In Maxi Yatzy, pairs/kinds are often scored based on *all* dice, not just 5.
 * We adapt standard Yatzy rules here: finds the highest N-of-a-kind.
 * For One Pair (requiredCount=2), it finds the highest pair.
 *
 * @param dice An array of numbers representing the dice roll.
 * @param requiredCount The number of identical dice required (2 for Pair, 3 for Kind, 4 for Kind).
 * @returns The sum of the highest value N of a Kind found, or 0 if none exists.
 */
export const calculateNOfAKind = (
  dice: number[],
  requiredCount: number,
): number => {
  if (requiredCount < 2 || requiredCount > 6) return 0; // Max 6 dice
  const counts = getDiceCounts(dice);
  let highestKindValue = 0;

  for (let value = 6; value >= 1; value--) {
    if (counts[value] >= requiredCount) {
      highestKindValue = value;
      break;
    }
  }

  return highestKindValue > 0 ? highestKindValue * requiredCount : 0;
};

/**
 * Calculates the score for Two Pairs.
 * Finds two distinct pairs and sums their values. Looks for the highest possible score.
 * @param dice An array of numbers representing the dice roll.
 * @returns The sum of the two pairs, or 0 if two distinct pairs are not found.
 */
export const calculateTwoPairs = (dice: number[]): number => {
  const counts = getDiceCounts(dice);
  const pairs: number[] = [];

  for (let value = 6; value >= 1; value--) {
    if (counts[value] >= 2) {
      pairs.push(value);
    }
  }

  if (pairs.length >= 2) {
    // Ensure we select the highest two distinct pairs if more are available
    // (e.g., from a Full House or 4/5/6 of a kind)
    return pairs[0] * 2 + pairs[1] * 2;
  }

  return 0;
};

/**
 * Calculates the score for Small Straight (1-2-3-4-5).
 * @param dice An array of numbers representing the dice roll.
 * @returns 15 if a Small Straight is present, otherwise 0.
 */
export const calculateSmallStraight = (dice: number[]): number => {
  const uniqueDice = new Set(dice);
  const required = [1, 2, 3, 4, 5];
  const hasStraight = required.every((value) => uniqueDice.has(value));
  return hasStraight ? 15 : 0; // Standard Yatzy score for Small Straight
};

/**
 * Calculates the score for Large Straight (2-3-4-5-6).
 * @param dice An array of numbers representing the dice roll.
 * @returns 20 if a Large Straight is present, otherwise 0.
 */
export const calculateLargeStraight = (dice: number[]): number => {
  const uniqueDice = new Set(dice);
  const required = [2, 3, 4, 5, 6];
  const hasStraight = required.every((value) => uniqueDice.has(value));
  return hasStraight ? 20 : 0; // Standard Yatzy score for Large Straight
};

/**
 * Calculates the score for Full House (three of one kind, two of another).
 * Finds the highest scoring Full House if multiple combinations exist (e.g., with 6 dice).
 * @param dice An array of numbers representing the dice roll.
 * @returns The sum of all dice if a Full House is present, otherwise 0.
 */
export const calculateFullHouse = (dice: number[]): number => {
  const counts = getDiceCounts(dice);
  let hasThree = false;
  let hasTwo = false;
  let threeValue = 0;
  let twoValue = 0;

  // Check if there is a Yatzy (5 or 6 of a kind) first, as it always qualifies for FH score
  for (let value = 6; value >= 1; value--) {
    if (counts[value] >= 5) {
        // Yatzy counts as a Full House score (sum of all dice)
        return dice.reduce((sum, die) => sum + die, 0);
    }
  }

  // If no Yatzy, check for standard Full House (3 of one, 2 of another)
  // Check for the highest three-of-a-kind first
  for (let value = 6; value >= 1; value--) {
    if (counts[value] >= 3) {
      hasThree = true;
      threeValue = value;
      break;
    }
  }

  // If three-of-a-kind found, check for the highest pair (different value)
  if (hasThree) {
    for (let value = 6; value >= 1; value--) {
      if (value !== threeValue && counts[value] >= 2) {
        hasTwo = true;
        twoValue = value;
        break;
      }
    }
  }

  // A special case for 6 dice: check if there are *two* sets of three-of-a-kind
  // This case is now implicitly handled if one of the triples wasn't a Yatzy
  if (!hasTwo && hasThree) {
      let otherThreeValue = 0;
      for (let value = 6; value >= 1; value--) {
          if (value !== threeValue && counts[value] >= 3) {
              otherThreeValue = value;
              hasTwo = true; // Found another triple, counts as 3+2 FH
              break;
          }
      }
  }

  // Standard Yatzy scoring: sum of all dice if it's a Full House
  return hasThree && hasTwo ? dice.reduce((sum, die) => sum + die, 0) : 0;
};

/**
 * Calculates the score for Chance (sum of all dice).
 * @param dice An array of numbers representing the dice roll.
 * @returns The sum of all dice values.
 */
export const calculateChance = (dice: number[]): number => {
  return dice.reduce((sum, die) => sum + die, 0);
};

/**
 * Calculates the score for Yatzy (Five of a Kind).
 * The rules specify 5 of a kind, even with 6 dice.
 * @param dice An array of numbers representing the dice roll.
 * @returns 50 if a Yatzy (at least five identical dice) is present, otherwise 0.
 */
export const calculateYatzy = (dice: number[]): number => {
  const counts = getDiceCounts(dice);
  for (const value in counts) {
    if (counts[value] >= 5) {
      return 50;
    }
  }
  return 0;
};

/**
 * Calculates potential scores for all categories based on the current dice.
 * Does not consider if a category has already been used.
 *
 * @param dice The current array of dice values (should have 6 dice).
 * @returns An object mapping category names to their potential scores.
 */
export const calculatePotentialScores = (
  dice: number[],
): Record<string, number> => {
  if (dice.length !== 6) {
    console.warn('Calculating scores with incorrect number of dice:', dice.length);
    // Handle appropriately, maybe return empty scores or throw error
    // For now, proceed but results might be unexpected
  }

  return {
    Ones: calculateSingles(dice, 1),
    Twos: calculateSingles(dice, 2),
    Threes: calculateSingles(dice, 3),
    Fours: calculateSingles(dice, 4),
    Fives: calculateSingles(dice, 5),
    Sixes: calculateSingles(dice, 6),
    OnePair: calculateNOfAKind(dice, 2), // Highest pair score
    TwoPairs: calculateTwoPairs(dice),
    ThreeOfAKind: calculateNOfAKind(dice, 3), // Highest 3-kind score
    FourOfAKind: calculateNOfAKind(dice, 4), // Highest 4-kind score
    SmallStraight: calculateSmallStraight(dice),
    LargeStraight: calculateLargeStraight(dice),
    FullHouse: calculateFullHouse(dice),
    Chance: calculateChance(dice),
    Yatzy: calculateYatzy(dice),
    // Note: Upper Section Bonus and Yatzy Bonus are calculated based on filled scores, not a single roll.
  };
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