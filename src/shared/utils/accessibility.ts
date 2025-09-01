// Accessibility constants and utilities
export const ACCESSIBILITY = {
  // ARIA labels
  LABELS: {
    GAME_MODE_SELECT: 'Select game mode',
    STARTING_SCORE_INPUT: 'Enter starting score',
    STARTING_LIVES_INPUT: 'Enter starting lives',
    PLAYER_NAME_INPUT: 'Enter player name',
    SCORE_INPUT: 'Enter score for current turn',
    ADD_PLAYER_BUTTON: 'Add new player',
    REMOVE_PLAYER_BUTTON: 'Remove player',
    START_GAME_BUTTON: 'Start game with current settings',
    SUBMIT_SCORE_BUTTON: 'Submit score',
    RESET_GAME_BUTTON: 'Reset current game',
    NEW_GAME_BUTTON: 'Start new game',
    BACK_TO_SETUP_BUTTON: 'Return to game setup',
    HISTORY_BUTTON: 'View player history',
    ALL_HISTORY_BUTTON: 'View all players history',
    CLOSE_MODAL_BUTTON: 'Close modal',
    NOTIFICATION_CLOSE_BUTTON: 'Close notification',
    HIGH_LOW_CHALLENGE_BUTTON: 'Set high-low challenge',
  } as const,

  // ARIA descriptions
  DESCRIPTIONS: {
    GAME_MODE_COUNTDOWN: 'Countdown mode: Players start with a score and count down to zero',
    GAME_MODE_HIGH_LOW: 'High-Low mode: Players compete with lives and set challenges',
    SCORE_INPUT_HELP: 'Enter a score between 0 and 180. Press Enter to submit.',
    PLAYER_LIMITS: 'Minimum 2 players, maximum 8 players allowed',
    SCORE_LIMITS: 'Score must be between 0 and 180 points',
    LIVES_LIMITS: 'Starting lives must be between 1 and 10',
  } as const,

  // Keyboard shortcuts
  KEYBOARD: {
    ENTER: 'Enter',
    ESCAPE: 'Escape',
    TAB: 'Tab',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    SPACE: ' ',
  } as const,

  // Focus management
  FOCUS: {
    FIRST_INTERACTIVE: 'first-interactive',
    LAST_INTERACTIVE: 'last-interactive',
    MODAL_TRAP: 'modal-trap',
  } as const,
} as const;

/**
 * Generates a unique ID for accessibility purposes
 * @param prefix - The prefix for the ID
 * @returns A unique ID string
 */
export const generateAriaId = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Handles keyboard navigation for a list of focusable elements
 * @param event - The keyboard event
 * @param currentIndex - The current focused index
 * @param totalItems - The total number of items
 * @param onIndexChange - Callback when index changes
 */
export const handleListNavigation = (
  event: React.KeyboardEvent,
  currentIndex: number,
  totalItems: number,
  onIndexChange: (index: number) => void
): void => {
  switch (event.key) {
    case ACCESSIBILITY.KEYBOARD.ARROW_DOWN:
    case ACCESSIBILITY.KEYBOARD.ARROW_RIGHT: {
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % totalItems;
      onIndexChange(nextIndex);
      break;
    }
    case ACCESSIBILITY.KEYBOARD.ARROW_UP:
    case ACCESSIBILITY.KEYBOARD.ARROW_LEFT: {
      event.preventDefault();
      const prevIndex = currentIndex === 0 ? totalItems - 1 : currentIndex - 1;
      onIndexChange(prevIndex);
      break;
    }
    case ACCESSIBILITY.KEYBOARD.ENTER:
    case ACCESSIBILITY.KEYBOARD.SPACE:
      event.preventDefault();
      // Trigger the current item's action
      break;
  }
};

/**
 * Creates a focus trap for modal dialogs
 * @param containerRef - Reference to the modal container
 * @param onEscape - Callback for escape key
 */
export const createFocusTrap = (
  containerRef: React.RefObject<HTMLElement>,
  onEscape?: () => void
): (() => void) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === ACCESSIBILITY.KEYBOARD.ESCAPE && onEscape) {
      onEscape();
      return;
    }

    if (event.key === ACCESSIBILITY.KEYBOARD.TAB) {
      const container = containerRef.current;
      if (!container) return;

      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  document.addEventListener('keydown', handleKeyDown);

  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Announces a message to screen readers
 * @param message - The message to announce
 * @param priority - The priority level (polite or assertive)
 */
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove the announcement after it's been read
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Validates if an element is focusable
 * @param element - The element to check
 * @returns True if the element is focusable
 */
export const isFocusable = (element: HTMLElement): boolean => {
  const tagName = element.tagName.toLowerCase();
  const tabIndex = element.getAttribute('tabindex');
  
  // Elements that are naturally focusable
  if (['button', 'input', 'select', 'textarea', 'a'].includes(tagName)) {
    return true;
  }
  
  // Elements with tabindex >= 0
  if (tabIndex && parseInt(tabIndex) >= 0) {
    return true;
  }
  
  return false;
};
