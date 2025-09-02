import React from 'react';
import { render, screen } from '../../../../test-utils';

import { vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      // Return actual text for testing purposes
      const translations: Record<string, string> = {
        'app.header': 'Dart Score',
        'app.title': 'Dart Score Manager',
        'game.setup.startGame': 'Start Game',
        'game.setup.addPlayer': 'Add Player',
        'game.setup.playersSection': 'Players (minimum 2):',
        'game.setup.startingScore': 'Starting Score:',
        'game.setup.startingLives': 'Starting Lives:',
        'game.modes.label': 'Game Mode:',
        'game.modes.countdown': 'Countdown (501/301)',
        'game.modes.highLow': 'High-Low Challenge',
        'game.placeholders.playerName': 'Player {index} name',
        'game.placeholders.startingScore': '501',
        'game.placeholders.startingLives': '5',
        'game.placeholders.scoreInput': 'Enter score (0-180)',
        'game.actions.submit': 'Submit',
        'game.actions.resetGame': 'Reset Game',
        'game.actions.playAgain': 'Play Again',
        'game.actions.backToSetup': 'Back to Setup',
        'game.actions.allHistory': '📊 All History',
        'game.messages.bust': 'BUST! Score reverted to turn start.',
        'game.messages.winnerCongratulations': '🎉 Congratulations!',
        'game.messages.winnerWins': '{name} wins!',
        'game.messages.finalScoresCountdown': 'Final Scores & History',
        'game.messages.finalResultsHighLow': 'Final Results',
        'game.display.countdownModeIndicator': 'Countdown ({score})',
        'game.display.highLowModeIndicator': 'High-Low Challenge',
        'game.display.playerTurn': '{name}\'s Turn',
        'game.challenge.currentChallenge': 'Current Challenge',
        'game.challenge.mustScore': 'must score',
        'game.challenge.higher': 'higher',
        'game.challenge.lower': 'lower',
        'game.challenge.than': 'than',
        'game.challenge.higherThan': 'Higher than {score}',
        'game.challenge.lowerThan': 'Lower than {score}',
        'game.challenge.waitingForChallenge': 'Waiting for challenge to be set...',
        'errors.tooFewPlayers': 'At least 2 players are required to start a game',
      };
      
      let result = translations[key] || key;
      
      if (options && typeof options === 'object') {
        // Handle interpolation
        Object.entries(options).forEach(([k, v]) => {
          result = result.replace(new RegExp(`{${k}}`, 'g'), String(v));
        });
      }
      
      return result;
    },
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
}));

import HighLowGameBoard from '../HighLowGameBoard';
import { GameState, Player } from '../../../../shared/types/game';

const createMockPlayer = (name: string, score: number = 40, lives: number = 5): Player => ({
  id: `player-${name.toLowerCase()}`,
  name,
  score,
  isWinner: false,
  turnStartScore: score,
  scoreHistory: [],
  lives,
});

const createMockGameState = (players: Player[], currentPlayerIndex: number = 0): GameState => ({
  players,
  currentPlayerIndex,
  gameFinished: false,
  winner: null,
  lastThrowWasBust: false,
  gameMode: 'high-low',
  startingLives: 5,
});

const createMockProps = (gameState: GameState, currentPlayer: Player | null = null) => ({
  gameState,
  currentPlayer: currentPlayer || gameState.players[gameState.currentPlayerIndex] || null,
  onSubmitHighLowScore: vi.fn(),
  onSetChallenge: vi.fn(),
  onNextPlayer: vi.fn(),
  onResetGame: vi.fn(),
  onNewGame: vi.fn(),
});

describe('HighLowGameBoard', () => {
  it('should render player list with lives', () => {
    const players = [
      createMockPlayer('Alice', 40, 5),
      createMockPlayer('Bob', 60, 3),
    ];
    const gameState = createMockGameState(players);
    const props = createMockProps(gameState);

    render(<HighLowGameBoard {...props} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Lives: 5')).toBeInTheDocument();
    expect(screen.getByText('Lives: 3')).toBeInTheDocument();
  });

  it('should show eliminated player correctly', () => {
    const players = [
      createMockPlayer('Alice', 40, 5),
      createMockPlayer('Bob', 60, 0), // Eliminated
    ];
    const gameState = createMockGameState(players);
    const props = createMockProps(gameState);

    render(<HighLowGameBoard {...props} />);

    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Lives: 0')).toBeInTheDocument();
    // Check for eliminated CSS class on the player card
    const bobCard = screen.getByText('Bob').closest('.player-card');
    expect(bobCard).toHaveClass('eliminated');
  });

  it('should display winner when game is finished', () => {
    const players = [
      createMockPlayer('Alice', 40, 5),
      createMockPlayer('Bob', 60, 0),
    ];
    const gameState = createMockGameState(players);
    gameState.gameFinished = true;
    gameState.winner = players[0];
    players[0].isWinner = true;
    const props = createMockProps(gameState);

    render(<HighLowGameBoard {...props} />);

    expect(screen.getByText('🎉 Congratulations!')).toBeInTheDocument();
    expect(screen.getByText('Alice wins!')).toBeInTheDocument();
  });
});
