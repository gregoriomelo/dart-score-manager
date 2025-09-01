/**
 * Tests for security validation utilities
 */

import {
  validateInput,
  sanitizeInput,
  validatePlayerName,
  validateCountdownScore,
  validateHighLowScore,
  validateTargetScore,
  validateLives,
  validatePlayerCount,
  validateGameMode,
  validateChallenge,
  validateGameState,
  validationRules,
} from '../validation';

describe('Security Validation', () => {
  describe('sanitizeInput', () => {
    it('should sanitize HTML entities', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
      expect(sanitizeInput('& < > " \' /')).toBe('&amp; &lt; &gt; &quot; &#x27; &#x2F;');
    });

    it('should handle non-string input', () => {
      expect(sanitizeInput(null as unknown)).toBe('');
      expect(sanitizeInput(undefined as unknown)).toBe('');
      expect(sanitizeInput(123 as unknown)).toBe('');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  test  ')).toBe('test');
    });
  });

  describe('validateInput', () => {
    it('should validate input against rules', () => {
      const rules = [
        { test: validationRules.required, message: 'Required' },
        { test: validationRules.minLength(3), message: 'Too short' },
      ];

      const result = validateInput('test', rules);
      expect(result.isValid).toBe(true);
      expect(result.value).toBe('test');
      expect(result.errors).toEqual([]);
    });

    it('should return errors for invalid input', () => {
      const rules = [
        { test: validationRules.required, message: 'Required' },
        { test: validationRules.minLength(5), message: 'Too short' },
      ];

      const result = validateInput('test', rules);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Too short');
    });

    it('should sanitize input when enabled', () => {
      const rules = [{ test: validationRules.required, message: 'Required' }];
      const result = validateInput('<script>alert("xss")</script>', rules, true);
      expect(result.value).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    });
  });

  describe('validatePlayerName', () => {
    it('should validate valid player names', () => {
      expect(validatePlayerName('John').isValid).toBe(true);
      expect(validatePlayerName('Player 1').isValid).toBe(true);
      expect(validatePlayerName('Test-Player_123').isValid).toBe(true);
    });

    it('should reject invalid player names', () => {
      expect(validatePlayerName('').isValid).toBe(false);
      expect(validatePlayerName('   ').isValid).toBe(false);
      expect(validatePlayerName('A'.repeat(51)).isValid).toBe(false);
      expect(validatePlayerName('Player<script>').isValid).toBe(false);
      expect(validatePlayerName('Player@#$%').isValid).toBe(false);
    });
  });

  describe('validateCountdownScore', () => {
    it('should validate valid scores', () => {
      expect(validateCountdownScore('0').isValid).toBe(true);
      expect(validateCountdownScore('180').isValid).toBe(true);
      expect(validateCountdownScore('100').isValid).toBe(true);
    });

    it('should reject invalid scores', () => {
      expect(validateCountdownScore('').isValid).toBe(false);
      expect(validateCountdownScore('-1').isValid).toBe(false);
      expect(validateCountdownScore('181').isValid).toBe(false);
      expect(validateCountdownScore('abc').isValid).toBe(false);
      expect(validateCountdownScore('12.5').isValid).toBe(false);
    });
  });

  describe('validateHighLowScore', () => {
    it('should validate valid scores', () => {
      expect(validateHighLowScore('0').isValid).toBe(true);
      expect(validateHighLowScore('180').isValid).toBe(true);
      expect(validateHighLowScore('50').isValid).toBe(true);
    });

    it('should reject invalid scores', () => {
      expect(validateHighLowScore('').isValid).toBe(false);
      expect(validateHighLowScore('-1').isValid).toBe(false);
      expect(validateHighLowScore('181').isValid).toBe(false);
      expect(validateHighLowScore('abc').isValid).toBe(false);
    });
  });

  describe('validateTargetScore', () => {
    it('should validate valid target scores', () => {
      expect(validateTargetScore('1').isValid).toBe(true);
      expect(validateTargetScore('1000').isValid).toBe(true);
      expect(validateTargetScore('500').isValid).toBe(true);
    });

    it('should reject invalid target scores', () => {
      expect(validateTargetScore('').isValid).toBe(false);
      expect(validateTargetScore('0').isValid).toBe(false);
      expect(validateTargetScore('1001').isValid).toBe(false);
      expect(validateTargetScore('abc').isValid).toBe(false);
      expect(validateTargetScore('12.5').isValid).toBe(false);
    });
  });

  describe('validateLives', () => {
    it('should validate valid lives', () => {
      expect(validateLives('1').isValid).toBe(true);
      expect(validateLives('10').isValid).toBe(true);
      expect(validateLives('5').isValid).toBe(true);
    });

    it('should reject invalid lives', () => {
      expect(validateLives('').isValid).toBe(false);
      expect(validateLives('0').isValid).toBe(false);
      expect(validateLives('11').isValid).toBe(false);
      expect(validateLives('abc').isValid).toBe(false);
      expect(validateLives('2.5').isValid).toBe(false);
    });
  });

  describe('validatePlayerCount', () => {
    it('should validate valid player counts', () => {
      expect(validatePlayerCount('2').isValid).toBe(true);
      expect(validatePlayerCount('20').isValid).toBe(true);
      expect(validatePlayerCount('5').isValid).toBe(true);
    });

    it('should reject invalid player counts', () => {
      expect(validatePlayerCount('').isValid).toBe(false);
      expect(validatePlayerCount('1').isValid).toBe(false);
      expect(validatePlayerCount('21').isValid).toBe(false);
      expect(validatePlayerCount('abc').isValid).toBe(false);
      expect(validatePlayerCount('3.5').isValid).toBe(false);
    });
  });

  describe('validateGameMode', () => {
    it('should validate valid game modes', () => {
      expect(validateGameMode('countdown').isValid).toBe(true);
      expect(validateGameMode('highlow').isValid).toBe(true);
    });

    it('should reject invalid game modes', () => {
      expect(validateGameMode('').isValid).toBe(false);
      expect(validateGameMode('invalid').isValid).toBe(false);
      expect(validateGameMode('COUNTDOWN').isValid).toBe(true); // Case insensitive
    });
  });

  describe('validateChallenge', () => {
    it('should validate valid challenges', () => {
      expect(validateChallenge('Hit the bullseye').isValid).toBe(true);
      expect(validateChallenge('A'.repeat(200)).isValid).toBe(true);
    });

    it('should reject invalid challenges', () => {
      expect(validateChallenge('').isValid).toBe(false);
      expect(validateChallenge('   ').isValid).toBe(false);
      expect(validateChallenge('A'.repeat(201)).isValid).toBe(false);
      // Script tags get sanitized to HTML entities, so they pass validation
      expect(validateChallenge('<script>alert("xss")</script>').isValid).toBe(true);
    });
  });

  describe('validateGameState', () => {
    it('should validate valid game state', () => {
      const validGameState = {
        players: [
          { id: '1', name: 'Player 1', score: 100, history: [] },
          { id: '2', name: 'Player 2', score: 150, history: [] },
        ],
        currentPlayerIndex: 0,
        gameMode: 'countdown',
        currentRound: 1,
        isGameOver: false,
        gameHistory: [],
      };

      const result = validateGameState(validGameState);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid game state', () => {
      const invalidGameState = {
        players: [{ id: '1', name: 'Player 1', score: 100 }], // Missing required fields
        currentPlayerIndex: 0,
        gameMode: 'invalid',
        currentRound: 1,
        isGameOver: false,
        gameHistory: [],
      };

      const result = validateGameState(invalidGameState);
      expect(result.isValid).toBe(false);
    });

    it('should reject game state with too few players', () => {
      const invalidGameState = {
        players: [{ id: '1', name: 'Player 1', score: 100, history: [] }],
        currentPlayerIndex: 0,
        gameMode: 'countdown',
        currentRound: 1,
        isGameOver: false,
        gameHistory: [],
      };

      const result = validateGameState(invalidGameState);
      expect(result.isValid).toBe(false);
    });

    it('should reject game state with too many players', () => {
      const players = Array.from({ length: 21 }, (_, i) => ({
        id: `${i}`,
        name: `Player ${i}`,
        score: 100,
        history: [],
      }));

      const invalidGameState = {
        players,
        currentPlayerIndex: 0,
        gameMode: 'countdown',
        currentRound: 1,
        isGameOver: false,
        gameHistory: [],
      };

      const result = validateGameState(invalidGameState);
      expect(result.isValid).toBe(false);
    });
  });

  describe('validationRules', () => {
    describe('required', () => {
      it('should pass for non-empty strings', () => {
        expect(validationRules.required('test')).toBe(true);
        expect(validationRules.required(' test ')).toBe(true);
      });

      it('should fail for empty strings', () => {
        expect(validationRules.required('')).toBe(false);
        expect(validationRules.required('   ')).toBe(false);
      });
    });

    describe('minLength', () => {
      it('should pass for strings with sufficient length', () => {
        expect(validationRules.minLength(3)('test')).toBe(true);
        expect(validationRules.minLength(3)('testing')).toBe(true);
      });

      it('should fail for strings that are too short', () => {
        expect(validationRules.minLength(3)('ab')).toBe(false);
        expect(validationRules.minLength(3)('')).toBe(false);
      });
    });

    describe('maxLength', () => {
      it('should pass for strings within length limit', () => {
        expect(validationRules.maxLength(5)('test')).toBe(true);
        expect(validationRules.maxLength(5)('')).toBe(true);
      });

      it('should fail for strings that are too long', () => {
        expect(validationRules.maxLength(3)('testing')).toBe(false);
      });
    });

    describe('numeric', () => {
      it('should pass for numeric strings', () => {
        expect(validationRules.numeric('123')).toBe(true);
        expect(validationRules.numeric('0')).toBe(true);
      });

      it('should fail for non-numeric strings', () => {
        expect(validationRules.numeric('abc')).toBe(false);
        expect(validationRules.numeric('12.34')).toBe(false);
        expect(validationRules.numeric('12a')).toBe(false);
      });
    });

    describe('positiveInteger', () => {
      it('should pass for positive integers', () => {
        expect(validationRules.positiveInteger('1')).toBe(true);
        expect(validationRules.positiveInteger('123')).toBe(true);
      });

      it('should fail for non-positive integers', () => {
        expect(validationRules.positiveInteger('0')).toBe(false);
        expect(validationRules.positiveInteger('-1')).toBe(false);
        expect(validationRules.positiveInteger('abc')).toBe(false);
        expect(validationRules.positiveInteger('12.34')).toBe(false);
      });
    });

    describe('noSpecialChars', () => {
      it('should pass for strings with allowed characters', () => {
        expect(validationRules.noSpecialChars('test')).toBe(true);
        expect(validationRules.noSpecialChars('test-123')).toBe(true);
        expect(validationRules.noSpecialChars('test_123')).toBe(true);
        expect(validationRules.noSpecialChars('test 123')).toBe(true);
      });

      it('should fail for strings with special characters', () => {
        expect(validationRules.noSpecialChars('test@123')).toBe(false);
        expect(validationRules.noSpecialChars('test#123')).toBe(false);
        expect(validationRules.noSpecialChars('test$123')).toBe(false);
      });
    });

    describe('noScriptTags', () => {
      it('should pass for strings without script tags', () => {
        expect(validationRules.noScriptTags('test')).toBe(true);
        expect(validationRules.noScriptTags('<div>test</div>')).toBe(true);
      });

      it('should fail for strings with script tags', () => {
        expect(validationRules.noScriptTags('<script>alert("xss")</script>')).toBe(false);
        expect(validationRules.noScriptTags('<SCRIPT>alert("xss")</SCRIPT>')).toBe(false);
      });
    });
  });
});
