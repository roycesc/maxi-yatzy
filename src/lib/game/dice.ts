/**
 * Simulates rolling a single six-sided die.
 * @returns A random integer between 1 and 6.
 */
const rollSingleDie = (): number => {
  return Math.floor(Math.random() * 6) + 1;
};

/**
 * Rolls a specified number of dice.
 * @param numDice The number of dice to roll. Defaults to 6 for Maxi Yatzy.
 * @returns An array of numbers representing the results of each die roll.
 */
export const rollDice = (numDice: number = 6): number[] => {
  const results: number[] = [];
  for (let i = 0; i < numDice; i++) {
    results.push(rollSingleDie());
  }
  return results;
};

/**
 * Rerolls specific dice based on their indices.
 * Keeps the dice at the specified heldIndices and rolls new values for the others.
 *
 * @param currentDice The current array of dice values.
 * @param heldIndices An array of 0-based indices of the dice to keep.
 * @returns A new array of dice values with the non-held dice rerolled.
 */
export const rerollDice = (
  currentDice: number[],
  heldIndices: number[],
): number[] => {
  const heldSet = new Set(heldIndices);
  return currentDice.map((die, index) => {
    return heldSet.has(index) ? die : rollSingleDie();
  });
};
