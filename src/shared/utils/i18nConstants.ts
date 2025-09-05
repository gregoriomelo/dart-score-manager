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
    COUNTDOWN: 'game.modes.countdown',
    HIGH_LOW: 'game.modes.highLow'
  } as const
} as const;

// Translation Keys for UI Text
export const UI_TEXT_KEYS = {
  // App titles
  APP_TITLE: 'app.title',
  APP_HEADER: 'app.header',
  
  // Form labels
  GAME_MODE_LABEL: 'game.modes.label',
  STARTING_SCORE_LABEL: 'game.setup.startingScore',
  STARTING_LIVES_LABEL: 'game.setup.startingLives',
  PLAYERS_SECTION_TITLE: 'game.setup.playersSection',
  
  // Buttons
  ADD_PLAYER_BUTTON: 'game.setup.addPlayer',
  START_GAME_BUTTON: 'game.setup.startGame',
  SUBMIT_BUTTON: 'game.actions.submit',
  BUST_BUTTON: 'game.actions.bust',
  RESET_GAME_BUTTON: 'game.actions.resetGame',
  PLAY_AGAIN_BUTTON: 'game.actions.playAgain',
  BACK_TO_SETUP_BUTTON: 'game.actions.backToSetup',
  ALL_HISTORY_BUTTON: 'game.actions.allHistory',
  
  // Placeholders
  SCORE_INPUT_PLACEHOLDER: 'game.placeholders.scoreInput',
  PLAYER_NAME_PLACEHOLDER: 'game.placeholders.playerName',
  STARTING_SCORE_PLACEHOLDER: 'game.placeholders.startingScore',
  STARTING_LIVES_PLACEHOLDER: 'game.placeholders.startingLives',
  
  // Error messages
  INVALID_SCORE_ERROR: 'errors.invalidScore',
  INVALID_SCORE_ENTRY_ERROR: 'errors.invalidScoreEntry',
  SCORE_TOO_HIGH_ERROR: 'errors.scoreTooHigh',
  SCORE_TOO_LOW_ERROR: 'errors.scoreTooLow',
  INVALID_PLAYER_NAME_ERROR: 'errors.invalidPlayerName',
  TOO_FEW_PLAYERS_ERROR: 'errors.tooFewPlayers',
  TOO_MANY_PLAYERS_ERROR: 'errors.tooManyPlayers',
  INVALID_STARTING_SCORE_ERROR: 'errors.invalidStartingScore',
  INVALID_STARTING_LIVES_ERROR: 'errors.invalidStartingLives',
  
  // Success messages
  GAME_STARTED_SUCCESS: 'game.messages.gameStarted',
  SCORE_SUBMITTED_SUCCESS: 'game.messages.scoreSubmitted',
  PLAYER_ADDED_SUCCESS: 'game.messages.playerAdded',
  PLAYER_REMOVED_SUCCESS: 'game.messages.playerRemoved',
  GAME_RESET_SUCCESS: 'game.messages.gameReset',
  CHALLENGE_SET_SUCCESS: 'game.messages.challengeSet',
  
  // Game messages
  BUST_MESSAGE: 'game.messages.bust',
  WINNER_CONGRATULATIONS: 'game.messages.winnerCongratulations',
  WINNER_WINS: 'game.messages.winnerWins',
  FINAL_SCORES_COUNTDOWN: 'game.messages.finalScoresCountdown',
  FINAL_RESULTS_HIGH_LOW: 'game.messages.finalResultsHighLow',
  
  // Player display
  PLAYER_LIVES_LABEL: 'game.display.playerLives',
  PLAYER_SCORE_LABEL: 'game.display.playerScore',
  HISTORY_BUTTON_TITLE: 'game.display.historyButtonTitle',
  COUNTDOWN_MODE_INDICATOR: 'game.display.countdownModeIndicator',
  HIGH_LOW_MODE_INDICATOR: 'game.display.highLowModeIndicator'
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
  SCORE_INPUT_INVALID: 'score-input-invalid',
  SUBMIT_SCORE_BTN: 'submit-score-btn',
  BUST_BTN: 'bust-btn',
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
