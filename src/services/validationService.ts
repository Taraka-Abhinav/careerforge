import { XPService } from './xpService';
import type { UserProgress } from '../types';
import { runWithInvoke } from '../utils/challengeRunner';

export const ValidationService = {
  calculateLevel: XPService.calculateLevel,

  async awardXP(userId: string, xpAmount: number, sourceType: Parameters<typeof XPService.awardOnce>[1] = 'challenge', sourceId = 'legacy') {
    return XPService.awardOnce(userId, sourceType, sourceId, xpAmount);
  },

  async validateChallenge(
    _userId: string,
    _challengeId: string,
    codeSubmission: string,
    testCases: { input: Record<string, unknown>; expected: unknown }[] = [],
    invoke?: string
  ): Promise<boolean> {
    if (!testCases.length || !codeSubmission.trim()) return false;

    for (const tc of testCases) {
      try {
        let result: unknown;
        if (invoke) {
          result = runWithInvoke(codeSubmission, invoke, tc.input);
        } else {
          const runner = new Function(
            'input',
            `
          ${codeSubmission}
          if (typeof twoSum === 'function' && input.nums !== undefined) return twoSum(input.nums, input.target);
          if (typeof sumToN === 'function' && input.n !== undefined) return sumToN(input.n);
          if (typeof fizzBuzz === 'function' && input.n !== undefined) return fizzBuzz(input.n);
          if (typeof countActive === 'function' && input.rows !== undefined) return countActive(input.rows);
          if (typeof flattenIds === 'function' && input.node !== undefined) return flattenIds(input.node);
          if (typeof solve === 'function') return solve(input);
          return null;
        `
          );
          result = runner(tc.input);
        }
        if (JSON.stringify(result) !== JSON.stringify(tc.expected)) return false;
      } catch {
        return false;
      }
    }
    return true;
  },
};

export type { UserProgress };
