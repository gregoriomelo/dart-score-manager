import React from 'react';
import { render, screen } from '../../../../test-utils';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, string | number>) => {
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

import PlayerSetup from '../PlayerSetup';

describe('PlayerSetup', () => {
  const mockOnStartGame = vi.fn();

  beforeEach(() => {
    mockOnStartGame.mockClear();
  });

  it('renders with default values', () => {
    render(<PlayerSetup onStartGame={mockOnStartGame} />);
    
    expect(screen.getByText('Dart Score')).toBeInTheDocument();
    expect(screen.getByDisplayValue('501')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Player 1 name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Player 2 name')).toBeInTheDocument();
    expect(screen.getByText('Start Game')).toBeDisabled();
  });

  it('allows changing starting score', async () => {
    const user = userEvent.setup();
    render(<PlayerSetup onStartGame={mockOnStartGame} />);
    
    const scoreInput = screen.getByDisplayValue('501') as HTMLInputElement;
    scoreInput.focus();
    scoreInput.select();
    await user.keyboard('301');
    
    expect(scoreInput).toHaveValue(301);
  });

  it('allows entering player names', async () => {
    const user = userEvent.setup();
    render(<PlayerSetup onStartGame={mockOnStartGame} />);
    
    const player1Input = screen.getByPlaceholderText('Player 1 name');
    const player2Input = screen.getByPlaceholderText('Player 2 name');
    
    await user.type(player1Input, 'Alice');
    await user.type(player2Input, 'Bob');
    
    expect(player1Input).toHaveValue('Alice');
    expect(player2Input).toHaveValue('Bob');
  });

  it('enables start game button when at least 2 players have names', async () => {
    const user = userEvent.setup();
    render(<PlayerSetup onStartGame={mockOnStartGame} />);
    
    const startButton = screen.getByText('Start Game');
    expect(startButton).toBeDisabled();
    
    await user.type(screen.getByPlaceholderText('Player 1 name'), 'Alice');
    expect(startButton).toBeDisabled();
    
    await user.type(screen.getByPlaceholderText('Player 2 name'), 'Bob');
    expect(startButton).toBeEnabled();
  });

  it('allows adding more players', async () => {
    const user = userEvent.setup();
    render(<PlayerSetup onStartGame={mockOnStartGame} />);
    
    expect(screen.getAllByRole('textbox')).toHaveLength(2); // 2 player inputs (score input is type="number")
    
    await user.click(screen.getByText('Add Player'));
    
    expect(screen.getAllByRole('textbox')).toHaveLength(3); // 3 player inputs
    expect(screen.getByPlaceholderText('Player 3 name')).toBeInTheDocument();
  });

  it('allows removing players when there are more than 2', async () => {
    const user = userEvent.setup();
    render(<PlayerSetup onStartGame={mockOnStartGame} />);
    
    // Add a third player
    await user.click(screen.getByText('Add Player'));
    expect(screen.getAllByRole('textbox')).toHaveLength(3); // 3 player inputs
    
    // Remove buttons should now be visible
    const removeButtons = screen.getAllByLabelText(/Remove player/);
    expect(removeButtons).toHaveLength(3);
    
    // Remove the third player
    await user.click(removeButtons[2]);
    expect(screen.getAllByRole('textbox')).toHaveLength(2); // 2 player inputs
  });

  it('does not show remove buttons when there are only 2 players', () => {
    render(<PlayerSetup onStartGame={mockOnStartGame} />);
    
    expect(screen.queryByLabelText(/Remove player/)).not.toBeInTheDocument();
  });

  it('limits player names to 20 characters', async () => {
    const user = userEvent.setup();
    render(<PlayerSetup onStartGame={mockOnStartGame} />);
    
    const player1Input = screen.getByPlaceholderText('Player 1 name');
    
    await user.type(player1Input, 'ThisIsAVeryLongPlayerNameThatExceedsTwentyCharacters');
    
    expect(player1Input).toHaveValue('ThisIsAVeryLongPlaye'); // Should be truncated to 20 chars
  });

  it('calls onStartGame with valid player names and starting score', async () => {
    const user = userEvent.setup();
    render(<PlayerSetup onStartGame={mockOnStartGame} />);
    
    await user.type(screen.getByPlaceholderText('Player 1 name'), 'Alice');
    await user.type(screen.getByPlaceholderText('Player 2 name'), 'Bob');
    const scoreInput = screen.getByDisplayValue('501') as HTMLInputElement;
    scoreInput.focus();
    scoreInput.select();
    await user.keyboard('301');
    
    await user.click(screen.getByText('Start Game'));
    
    expect(mockOnStartGame).toHaveBeenCalledWith(['Alice', 'Bob'], 'countdown', 301, 5, 10);
  });

  it('filters out empty player names when starting game', async () => {
    const user = userEvent.setup();
    render(<PlayerSetup onStartGame={mockOnStartGame} />);
    
    await user.type(screen.getByPlaceholderText('Player 1 name'), 'Alice');
    await user.type(screen.getByPlaceholderText('Player 2 name'), 'Bob');
    await user.click(screen.getByText('Add Player'));
    // Leave third player name empty
    
    await user.click(screen.getByText('Start Game'));
    
    expect(mockOnStartGame).toHaveBeenCalledWith(['Alice', 'Bob'], 'countdown', 501, 5, 10);
  });

  it('trims whitespace from player names', async () => {
    const user = userEvent.setup();
    render(<PlayerSetup onStartGame={mockOnStartGame} />);
    
    await user.type(screen.getByPlaceholderText('Player 1 name'), '  Alice  ');
    await user.type(screen.getByPlaceholderText('Player 2 name'), '  Bob  ');
    
    await user.click(screen.getByText('Start Game'));
    
    expect(mockOnStartGame).toHaveBeenCalledWith(['Alice', 'Bob'], 'countdown', 501, 5, 10);
  });

  it('prevents adding more than 8 players', async () => {
    const user = userEvent.setup();
    render(<PlayerSetup onStartGame={mockOnStartGame} />);
    
    // Add players until we reach 8
    for (let i = 0; i < 6; i++) {
      await user.click(screen.getByText('Add Player'));
    }
    
    expect(screen.getAllByRole('textbox')).toHaveLength(8); // 8 player inputs
    expect(screen.queryByText('Add Player')).not.toBeInTheDocument();
  });
});
