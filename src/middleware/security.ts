/**
 * Security middleware for the application
 */

import { generateSecurityHeaders } from '../utils/security/csp';
import { validateInput, sanitizeInput } from '../utils/security/validation';

/**
 * Security middleware configuration
 */
export interface SecurityMiddlewareConfig {
  enableCSP?: boolean;
  enableValidation?: boolean;
  enableSanitization?: boolean;
  isProduction?: boolean;
}

/**
 * Security middleware class
 */
export class SecurityMiddleware {
  private config: SecurityMiddlewareConfig;

  constructor(config: SecurityMiddlewareConfig = {}) {
    this.config = {
      enableCSP: true,
      enableValidation: true,
      enableSanitization: true,
      isProduction: process.env.NODE_ENV === 'production',
      ...config,
    };
  }

  /**
   * Add security headers to response
   */
  addSecurityHeaders(): Record<string, string> {
    if (!this.config.enableCSP) {
      return {};
    }

    return generateSecurityHeaders(this.config.isProduction);
  }

  /**
   * Validate and sanitize input data
   */
  validateInput(
    data: any,
    validationRules: any[],
    context: string = 'input'
  ): { isValid: boolean; data: any; errors: string[] } {
    if (!this.config.enableValidation) {
      return { isValid: true, data, errors: [] };
    }

    try {
      if (typeof data === 'string') {
        const result = validateInput(data, validationRules, this.config.enableSanitization);
        return {
          isValid: result.isValid,
          data: result.value,
          errors: result.errors,
        };
      }

      // For objects, validate each string property
      if (typeof data === 'object' && data !== null) {
        const sanitizedData = { ...data };
        const errors: string[] = [];

        for (const [key, value] of Object.entries(data)) {
          if (typeof value === 'string') {
            const sanitizedValue = this.config.enableSanitization ? sanitizeInput(value) : value;
            sanitizedData[key] = sanitizedValue;
          }
        }

        return {
          isValid: errors.length === 0,
          data: sanitizedData,
          errors,
        };
      }

      return { isValid: true, data, errors: [] };
    } catch (error) {
      console.error(`Security validation error in ${context}:`, error);
      return {
        isValid: false,
        data: null,
        errors: [`Validation failed: ${error}`],
      };
    }
  }

  /**
   * Sanitize HTML content
   */
  sanitizeHTML(html: string): string {
    if (!this.config.enableSanitization) {
      return html;
    }

    return sanitizeInput(html);
  }

  /**
   * Validate game state
   */
  validateGameState(gameState: any): { isValid: boolean; data: any; errors: string[] } {
    if (!this.config.enableValidation) {
      return { isValid: true, data: gameState, errors: [] };
    }

    try {
      // Basic structure validation
      if (!gameState || typeof gameState !== 'object') {
        return {
          isValid: false,
          data: null,
          errors: ['Game state must be an object'],
        };
      }

      const errors: string[] = [];

      // Validate players array
      if (!Array.isArray(gameState.players)) {
        errors.push('Game state must have a players array');
      } else if (gameState.players.length < 2) {
        errors.push('Game must have at least 2 players');
      } else if (gameState.players.length > 20) {
        errors.push('Game cannot have more than 20 players');
      }

      // Validate current player index
      if (typeof gameState.currentPlayerIndex !== 'number') {
        errors.push('Current player index must be a number');
      } else if (gameState.currentPlayerIndex < 0 || gameState.currentPlayerIndex >= gameState.players.length) {
        errors.push('Current player index is out of bounds');
      }

      // Validate game mode
      if (gameState.gameMode !== 'countdown' && gameState.gameMode !== 'highlow') {
        errors.push('Game mode must be either "countdown" or "highlow"');
      }

      // Validate scores and other numeric values
      if (gameState.players) {
        gameState.players.forEach((player: any, index: number) => {
          if (typeof player.score !== 'number' || player.score < 0 || player.score > 180) {
            errors.push(`Player ${index + 1} has invalid score`);
          }
          if (player.lives !== undefined && (typeof player.lives !== 'number' || player.lives < 0 || player.lives > 10)) {
            errors.push(`Player ${index + 1} has invalid lives count`);
          }
        });
      }

      return {
        isValid: errors.length === 0,
        data: gameState,
        errors,
      };
    } catch (error) {
      console.error('Game state validation error:', error);
      return {
        isValid: false,
        data: null,
        errors: [`Game state validation failed: ${error}`],
      };
    }
  }

  /**
   * Create a secure input handler
   */
  createSecureInputHandler(validationRules: any[]) {
    return (input: any, context: string = 'input') => {
      return this.validateInput(input, validationRules, context);
    };
  }

  /**
   * Log security events
   */
  logSecurityEvent(event: string, details: any = {}): void {
    const securityEvent = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.warn('Security Event:', securityEvent);

    // In production, you might want to send this to a security monitoring service
    if (this.config.isProduction) {
      // Example: send to security monitoring service
      // this.sendToSecurityService(securityEvent);
    }
  }

  /**
   * Check for potential XSS in content
   */
  detectXSS(content: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    ];

    return xssPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Sanitize user input for display
   */
  sanitizeForDisplay(content: string): string {
    if (!this.config.enableSanitization) {
      return content;
    }

    // Check for XSS
    if (this.detectXSS(content)) {
      this.logSecurityEvent('XSS_DETECTED', { content: content.substring(0, 100) });
      return '[Content blocked for security]';
    }

    return sanitizeInput(content);
  }
}

/**
 * Default security middleware instance
 */
export const securityMiddleware = new SecurityMiddleware();

/**
 * Security utilities for React components
 */
export const securityUtils = {
  /**
   * Secure input validation hook
   */
  useSecureInput: (validationRules: any[]) => {
    return (input: any) => securityMiddleware.validateInput(input, validationRules);
  },

  /**
   * Secure display content
   */
  secureDisplay: (content: string) => securityMiddleware.sanitizeForDisplay(content),

  /**
   * Validate game state
   */
  validateGameState: (gameState: any) => securityMiddleware.validateGameState(gameState),
};
