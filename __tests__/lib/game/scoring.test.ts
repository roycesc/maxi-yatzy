import {
  calculateSingles,
  calculateUpperSectionBonus,
  calculateNOfAKind,
  calculateTwoPairs,
  calculateSmallStraight,
  calculateLargeStraight,
  calculateFullHouse,
  calculateChance,
  calculateYatzy,
  calculatePotentialScores,
} from '@/lib/game/scoring';

describe('Scoring Utilities', () => {
  // --- Upper Section ---
  describe('calculateSingles', () => {
    it('calculates Ones correctly', () => {
      expect(calculateSingles([1, 1, 2, 3, 1, 4], 1)).toBe(3);
      expect(calculateSingles([2, 3, 4, 5, 6, 2], 1)).toBe(0);
    });
    it('calculates Sixes correctly', () => {
      expect(calculateSingles([6, 5, 6, 4, 6, 3], 6)).toBe(18);
      expect(calculateSingles([1, 2, 3, 4, 5, 1], 6)).toBe(0);
    });
     it('returns 0 for invalid target value', () => {
      expect(calculateSingles([1, 1, 2, 3, 1, 4], 7)).toBe(0);
      expect(calculateSingles([1, 1, 2, 3, 1, 4], 0)).toBe(0);
    });
  });

  describe('calculateUpperSectionBonus', () => {
    it('returns 50 if total is 63 or more', () => {
      const scores = { Ones: 3, Twos: 6, Threes: 9, Fours: 12, Fives: 15, Sixes: 18 }; // Total 63
      expect(calculateUpperSectionBonus(scores)).toBe(50);
    });
    it('returns 50 if total is more than 63', () => {
      const scores = { Ones: 4, Twos: 8, Threes: 12, Fours: 16, Fives: 20, Sixes: 24 }; // Total 84
      expect(calculateUpperSectionBonus(scores)).toBe(50);
    });
    it('returns 0 if total is less than 63', () => {
      const scores = { Ones: 1, Twos: 2, Threes: 3, Fours: 4, Fives: 5, Sixes: 6 }; // Total 21
      expect(calculateUpperSectionBonus(scores)).toBe(0);
    });
    it('handles null scores correctly', () => {
      const scores = { Ones: 3, Twos: null, Threes: 9, Fours: 12, Fives: 15, Sixes: 18 }; // Total 57
      expect(calculateUpperSectionBonus(scores)).toBe(0);
    });
  });

  // --- Lower Section ---
  describe('calculateNOfAKind', () => {
    it('calculates One Pair (highest)', () => {
      expect(calculateNOfAKind([3, 4, 3, 5, 6, 5], 2)).toBe(10); // Pair of 5s > Pair of 3s
      expect(calculateNOfAKind([1, 1, 2, 3, 4, 5], 2)).toBe(2); // Pair of 1s
      expect(calculateNOfAKind([6, 6, 6, 6, 1, 2], 2)).toBe(12); // Pair of 6s (from 4 of a kind)
      expect(calculateNOfAKind([1, 2, 3, 4, 5, 6], 2)).toBe(0);
    });
    it('calculates Three of a Kind (highest)', () => {
      expect(calculateNOfAKind([3, 3, 3, 4, 5, 6], 3)).toBe(9);
      expect(calculateNOfAKind([5, 5, 5, 2, 2, 2], 3)).toBe(15); // 3x5 > 3x2
      expect(calculateNOfAKind([6, 6, 6, 6, 1, 2], 3)).toBe(18); // 3x6 (from 4 of a kind)
      expect(calculateNOfAKind([1, 1, 2, 2, 3, 4], 3)).toBe(0);
    });
    it('calculates Four of a Kind (highest)', () => {
      expect(calculateNOfAKind([4, 4, 4, 4, 5, 6], 4)).toBe(16);
      expect(calculateNOfAKind([5, 5, 5, 5, 5, 1], 4)).toBe(20); // 4x5 (from Yatzy)
      expect(calculateNOfAKind([6, 6, 6, 1, 2, 3], 4)).toBe(0);
    });
    it('returns 0 for invalid required count', () => {
        expect(calculateNOfAKind([1,1,1,1,1,1], 1)).toBe(0);
        expect(calculateNOfAKind([1,1,1,1,1,1], 7)).toBe(0);
    });
  });

  describe('calculateTwoPairs', () => {
    it('calculates Two Pairs correctly', () => {
      expect(calculateTwoPairs([2, 2, 3, 3, 4, 5])).toBe(10); // 2*2 + 2*3
      expect(calculateTwoPairs([5, 5, 6, 6, 6, 1])).toBe(22); // 2*6 + 2*5 (highest pairs)
    });
    it('returns 0 if only one pair', () => {
      expect(calculateTwoPairs([1, 1, 2, 3, 4, 5])).toBe(0);
    });
    it('returns 0 if three of a kind but no second pair', () => {
      expect(calculateTwoPairs([3, 3, 3, 1, 2, 4])).toBe(0);
    });
    it('calculates Two Pairs from Four of a Kind', () => {
        // Should NOT count 4-of-a-kind as two pairs per standard rules
        expect(calculateTwoPairs([4, 4, 4, 4, 1, 2])).toBe(0); 
    });
    it('calculates Two Pairs from Full House', () => {
        expect(calculateTwoPairs([5, 5, 5, 2, 2, 1])).toBe(14); // 2*5 + 2*2
    });
  });

  describe('calculateSmallStraight', () => {
    it('returns 15 for Small Straight (1-5)', () => {
      expect(calculateSmallStraight([1, 2, 3, 4, 5, 6])).toBe(15);
      expect(calculateSmallStraight([6, 5, 1, 4, 2, 3])).toBe(15);
      expect(calculateSmallStraight([1, 1, 2, 3, 4, 5])).toBe(15);
    });
    it('returns 0 if not Small Straight', () => {
      expect(calculateSmallStraight([1, 2, 3, 4, 6, 6])).toBe(0); // Missing 5
      expect(calculateSmallStraight([2, 3, 4, 5, 6, 6])).toBe(0); // Not 1-5
    });
  });

  describe('calculateLargeStraight', () => {
    it('returns 20 for Large Straight (2-6)', () => {
      expect(calculateLargeStraight([1, 2, 3, 4, 5, 6])).toBe(20);
      expect(calculateLargeStraight([6, 5, 2, 4, 3, 3])).toBe(20);
    });
    it('returns 0 if not Large Straight', () => {
      expect(calculateLargeStraight([1, 2, 3, 4, 5, 5])).toBe(0); // Missing 6
      expect(calculateLargeStraight([1, 1, 2, 3, 4, 5])).toBe(0); // Not 2-6
    });
  });

  describe('calculateFullHouse', () => {
    it('returns sum for standard Full House (3+2)', () => {
      expect(calculateFullHouse([3, 3, 3, 5, 5, 1])).toBe(20); // 3+3+3+5+5+1 = 20
      expect(calculateFullHouse([6, 6, 1, 1, 1, 2])).toBe(17); // 6+6+1+1+1+2 = 17
    });
     it('returns sum for Full House from 4 of a kind and a pair', () => {
      expect(calculateFullHouse([4, 4, 4, 4, 2, 2])).toBe(20); // 4+4+4+4+2+2 = 20
    });
     it('returns sum for Full House from 5 of a kind and one other', () => {
      expect(calculateFullHouse([5, 5, 5, 5, 5, 1])).toBe(26); // Treat as 3x5 + 2x5 -> 5+5+5+5+5+1 = 26
    });
    it('returns sum for Full House from two sets of 3 of a kind', () => {
      expect(calculateFullHouse([3, 3, 3, 6, 6, 6])).toBe(27); // 3+3+3+6+6+6 = 27
    });
    it('returns 0 if not Full House', () => {
      expect(calculateFullHouse([1, 1, 2, 2, 3, 3])).toBe(0); // Two pairs
      expect(calculateFullHouse([4, 4, 4, 1, 2, 3])).toBe(0); // Three of a kind only
      expect(calculateFullHouse([5, 5, 5, 5, 1, 2])).toBe(0); // Four of a kind only
    });
  });

  describe('calculateChance', () => {
    it('returns sum of all dice', () => {
      expect(calculateChance([1, 2, 3, 4, 5, 6])).toBe(21);
      expect(calculateChance([6, 6, 6, 6, 6, 6])).toBe(36);
      expect(calculateChance([1, 1, 1, 1, 1, 1])).toBe(6);
    });
  });

  describe('calculateYatzy', () => {
    it('returns 50 for 5 of a kind', () => {
      expect(calculateYatzy([4, 4, 4, 4, 4, 1])).toBe(50);
    });
    it('returns 50 for 6 of a kind (counts as Yatzy)', () => {
      expect(calculateYatzy([6, 6, 6, 6, 6, 6])).toBe(50);
    });
    it('returns 0 if less than 5 of a kind', () => {
      expect(calculateYatzy([1, 1, 1, 1, 2, 3])).toBe(0);
      expect(calculateYatzy([1, 2, 3, 4, 5, 6])).toBe(0);
    });
  });

  // --- Overall Calculation ---
  describe('calculatePotentialScores', () => {
    it('calculates all potential scores correctly for a sample roll', () => {
      const dice = [4, 4, 4, 5, 5, 6]; // Example: 3x4, 2x5, 1x6
      const expectedScores = {
        Ones: 0,
        Twos: 0,
        Threes: 0,
        Fours: 12,
        Fives: 10,
        Sixes: 6,
        OnePair: 10, // Pair of 5s > Pair of 4s
        TwoPairs: 18, // 2*4 + 2*5
        ThreeOfAKind: 12, // 3*4
        FourOfAKind: 0,
        SmallStraight: 0,
        LargeStraight: 0,
        FullHouse: 28, // 4+4+4+5+5+6 = 28
        Chance: 28,
        Yatzy: 0,
      };
      expect(calculatePotentialScores(dice)).toEqual(expectedScores);
    });

    it('calculates all potential scores for a Yatzy roll', () => {
      const dice = [6, 6, 6, 6, 6, 1];
      const potential = calculatePotentialScores(dice);
      expect(potential.Sixes).toBe(30);
      expect(potential.OnePair).toBe(12);
      expect(potential.ThreeOfAKind).toBe(18);
      expect(potential.FourOfAKind).toBe(24);
      // Full House rules might vary, standard Yatzy often allows Yatzy here
      // Our implementation requires distinct kinds (3+2), so FH is 0
      // Update: A Yatzy should also count as a Full House (sum of dice), revised test
      expect(potential.FullHouse).toBe(31); // Sum of all dice: 6*5 + 1
      expect(potential.Chance).toBe(31);
      expect(potential.Yatzy).toBe(50);
    });

     it('handles incorrect number of dice (logs warning, returns calculation)', () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
        const dice = [1, 2, 3];
        const scores = calculatePotentialScores(dice);
        expect(consoleWarnSpy).toHaveBeenCalledWith('Calculating scores with incorrect number of dice:', 3);
        expect(scores.Ones).toBe(1); // Calculation still proceeds
        consoleWarnSpy.mockRestore();
     });
  });
}); 