import { rollDice, rerollDice } from '@/lib/game/dice';

describe('Dice Utilities', () => {
  describe('rollDice', () => {
    it('should return 6 dice by default', () => {
      const dice = rollDice();
      expect(dice).toHaveLength(6);
    });

    it('should return the specified number of dice', () => {
      const dice = rollDice(3);
      expect(dice).toHaveLength(3);
    });

    it('should return dice values between 1 and 6', () => {
      const dice = rollDice(100); // Roll many dice
      dice.forEach((die) => {
        expect(die).toBeGreaterThanOrEqual(1);
        expect(die).toBeLessThanOrEqual(6);
      });
    });
  });

  describe('rerollDice', () => {
    it('should reroll only the dice not held', () => {
      const initialDice = [1, 2, 3, 4, 5, 6];
      const heldIndices = [0, 2, 4]; // Hold 1, 3, 5

      // Mock Math.random to control the outcome of rerolls
      const mockMath = Object.create(global.Math);
      const predictableRolls = [6, 6, 6]; // Values for the 3 dice being rerolled
      let rollIndex = 0;
      mockMath.random = () => (predictableRolls[rollIndex++] - 1) / 6; // Ensure predictable outcome
      global.Math = mockMath;

      const rerolledDice = rerollDice(initialDice, heldIndices);

      expect(rerolledDice).toHaveLength(6);
      expect(rerolledDice[0]).toBe(1); // Held
      expect(rerolledDice[1]).toBe(6); // Rerolled
      expect(rerolledDice[2]).toBe(3); // Held
      expect(rerolledDice[3]).toBe(6); // Rerolled
      expect(rerolledDice[4]).toBe(5); // Held
      expect(rerolledDice[5]).toBe(6); // Rerolled

      // Restore original Math.random
      global.Math = Object.create(global.Math);
    });

     it('should reroll all dice if none are held', () => {
      const initialDice = [1, 1, 1, 1, 1, 1];
      const heldIndices: number[] = [];

      // Use mock random again
      const mockMath = Object.create(global.Math);
      const predictableRolls = [2, 3, 4, 5, 6, 1];
      let rollIndex = 0;
      mockMath.random = () => (predictableRolls[rollIndex++] - 1) / 6;
      global.Math = mockMath;

      const rerolledDice = rerollDice(initialDice, heldIndices);

      expect(rerolledDice).not.toEqual(initialDice); // Should be different
      expect(rerolledDice).toEqual([2, 3, 4, 5, 6, 1]);

      global.Math = Object.create(global.Math); // Restore
    });

    it('should keep all dice if all are held', () => {
        const initialDice = [1, 2, 3, 4, 5, 6];
        const heldIndices = [0, 1, 2, 3, 4, 5];
        const rerolledDice = rerollDice(initialDice, heldIndices);
        expect(rerolledDice).toEqual(initialDice);
    });
  });
}); 