// Game Configuration Constants
export const GAME_CONSTANTS = {
  // Score limits
  MIN_SCORE: 0,
  MAX_SCORE: 180,
  
  // Default starting values
  DEFAULT_STARTING_SCORE: 501,
  DEFAULT_STARTING_LIVES: 5,
  
  // Player limits
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 8,
  
  // Input limits
  MAX_PLAYER_NAME_LENGTH: 20,
  
  // Game modes
  GAME_MODES: {
    COUNTDOWN: 'countdown',
    HIGH_LOW: 'high-low'
  } as const,
  
  // Display names
  GAME_MODE_NAMES: {
    COUNTDOWN: 'Countdown (501/301)',
    HIGH_LOW: 'High-Low Challenge'
  } as const
} as const;

// UI Text Constants
export const UI_TEXT = {
  // App titles
  APP_TITLE: 'Dart Score Manager',
  APP_HEADER: 'Dart Score',
  
  // Form labels
  GAME_MODE_LABEL: 'Game Mode:',
  STARTING_SCORE_LABEL: 'Starting Score:',
  STARTING_LIVES_LABEL: 'Starting Lives:',
  PLAYERS_SECTION_TITLE: 'Players (minimum 2):',
  
  // Buttons
  ADD_PLAYER_BUTTON: 'Add Player',
  START_GAME_BUTTON: 'Start Game',
  SUBMIT_BUTTON: 'Submit',
  RESET_GAME_BUTTON: 'Reset Game',
  PLAY_AGAIN_BUTTON: 'Play Again',
  BACK_TO_SETUP_BUTTON: 'Back to Setup',
  ALL_HISTORY_BUTTON: '📊 All History',
  
  // Placeholders
  SCORE_INPUT_PLACEHOLDER: 'Enter score (0-180)',
  PLAYER_NAME_PLACEHOLDER: 'Player {index} name',
  STARTING_SCORE_PLACEHOLDER: '501',
  STARTING_LIVES_PLACEHOLDER: '5',
  
  // Error messages
  INVALID_SCORE_ERROR: 'Please enter a valid score (0-180)',
  INVALID_SCORE_ENTRY_ERROR: 'Invalid score entry',
  SCORE_TOO_HIGH_ERROR: 'Score cannot exceed 180',
  SCORE_TOO_LOW_ERROR: 'Score cannot be negative',
  INVALID_PLAYER_NAME_ERROR: 'Player name must be between 1 and 20 characters',
  TOO_FEW_PLAYERS_ERROR: 'At least 2 players are required to start a game',
  TOO_MANY_PLAYERS_ERROR: 'Maximum 8 players allowed',
  INVALID_STARTING_SCORE_ERROR: 'Starting score must be greater than 0',
  INVALID_STARTING_LIVES_ERROR: 'Starting lives must be between 1 and 10',
  
  // Success messages
  GAME_STARTED_SUCCESS: 'Game started successfully!',
  SCORE_SUBMITTED_SUCCESS: 'Score submitted successfully!',
  PLAYER_ADDED_SUCCESS: 'Player added successfully!',
  PLAYER_REMOVED_SUCCESS: 'Player removed successfully!',
  GAME_RESET_SUCCESS: 'Game reset successfully!',
  CHALLENGE_SET_SUCCESS: 'Challenge set successfully!',
  
  // Game messages
  BUST_MESSAGE: 'BUST! Score reverted to turn start.',
  WINNER_CONGRATULATIONS: '🎉 Congratulations!',
  WINNER_WINS: '{name} wins!',
  FINAL_SCORES_COUNTDOWN: 'Final Scores & History',
  FINAL_RESULTS_HIGH_LOW: 'Final Results',
  
  // Player display
  PLAYER_LIVES_LABEL: 'Lives: {lives}',
  PLAYER_SCORE_LABEL: '{name}: Lives {lives}',
  HISTORY_BUTTON_TITLE: 'View {name}\'s score history',
  
  // Game mode indicators
  COUNTDOWN_MODE_INDICATOR: 'Countdown ({score})',
  HIGH_LOW_MODE_INDICATOR: 'High-Low Challenge'
} as const;

// CSS Class Names
export const CSS_CLASSES = {
  // Game board
  GAME_BOARD: 'game-board',
  GAME_MODE_INDICATOR: 'game-mode-indicator',
  PLAYERS_LIST: 'players-list',
  PLAYER_CARD: 'player-card',
  CURRENT_PLAYER: 'current-player',
  WINNER: 'winner',
  ELIMINATED: 'eliminated',
  
  // Player setup
  PLAYER_SETUP: 'player-setup',
  SETUP_FORM: 'setup-form',
  GAME_MODE_SECTION: 'game-mode-section',
  GAME_MODE_LABEL: 'game-mode-label',
  GAME_MODE_BUTTONS: 'game-mode-buttons',
  GAME_MODE_BUTTON: 'game-mode-button',
  GAME_MODE_BUTTON_ACTIVE: 'game-mode-button-active',
  PLAYERS_SECTION: 'players-section',
  PLAYER_INPUT: 'player-input',
  ADD_PLAYER_BTN: 'add-player-btn',
  REMOVE_PLAYER_BTN: 'remove-player-btn',
  START_GAME_BTN: 'start-game-btn',
  
  // Score input
  SCORE_INPUT_SECTION: 'score-input-section',
  SCORE_INPUT: 'score-input',
  SUBMIT_SCORE_BTN: 'submit-score-btn',
  BUST_MESSAGE: 'bust-message',
  BUST_BANNER: 'bust-banner',
  
  // Game actions
  GAME_ACTIONS: 'game-actions',
  CONSOLIDATED_HISTORY_BUTTON: 'consolidated-history-button',
  NEW_GAME_BTN: 'new-game-btn',
  BACK_TO_SETUP_BTN: 'back-to-setup-btn',
  
  // Winner announcement
  WINNER_ANNOUNCEMENT: 'winner-announcement',
  FINAL_SCORES: 'final-scores',
  
  // Player display
  PLAYER_NAME: 'player-name',
  PLAYER_SCORE: 'player-score',
  PLAYER_LIVES: 'player-lives',
  HISTORY_BTN: 'history-btn',
  CURRENT_SCORE: 'current-score',
  CURRENT_SCORE_ITEM: 'current-score-item',
  WINNER_BADGE: 'winner-badge',
  
  // Notifications - removed since we no longer use popup notifications
} as const;
