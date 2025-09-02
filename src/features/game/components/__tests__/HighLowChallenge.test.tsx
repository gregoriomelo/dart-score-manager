import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

import HighLowChallenge from '../HighLowChallenge';

describe('HighLowChallenge', () => {
  const mockOnSetChallenge = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render challenge buttons with reference score', () => {
    render(
      <HighLowChallenge
        currentPlayerName="Alice"
        lastScore={40}
        onSetChallenge={mockOnSetChallenge}
        showChallengeForm={true}
      />
    );

    expect(screen.getByText('↑ Higher than 40')).toBeInTheDocument();
    expect(screen.getByText('↓ Lower than 40')).toBeInTheDocument();
  });

  it('should use default score of 40 when lastScore is undefined', () => {
    render(
      <HighLowChallenge
        currentPlayerName="Bob"
        lastScore={undefined}
        onSetChallenge={mockOnSetChallenge}
        showChallengeForm={true}
      />
    );

    expect(screen.getByText('↑ Higher than 40')).toBeInTheDocument();
    expect(screen.getByText('↓ Lower than 40')).toBeInTheDocument();
  });

  it('should use provided lastScore as reference', () => {
    render(
      <HighLowChallenge
        currentPlayerName="Charlie"
        lastScore={75}
        onSetChallenge={mockOnSetChallenge}
        showChallengeForm={true}
      />
    );

    expect(screen.getByText('↑ Higher than 75')).toBeInTheDocument();
    expect(screen.getByText('↓ Lower than 75')).toBeInTheDocument();
  });

  it('should call onSetChallenge with higher direction when higher button is clicked', () => {
    render(
      <HighLowChallenge
        currentPlayerName="Alice"
        lastScore={50}
        onSetChallenge={mockOnSetChallenge}
        showChallengeForm={true}
      />
    );

    const higherButton = screen.getByText('↑ Higher than 50');
    fireEvent.click(higherButton);

    expect(mockOnSetChallenge).toHaveBeenCalledWith('higher', 50);
  });

  it('should call onSetChallenge with lower direction when lower button is clicked', () => {
    render(
      <HighLowChallenge
        currentPlayerName="Bob"
        lastScore={30}
        onSetChallenge={mockOnSetChallenge}
        showChallengeForm={true}
      />
    );

    const lowerButton = screen.getByText('↓ Lower than 30');
    fireEvent.click(lowerButton);

    expect(mockOnSetChallenge).toHaveBeenCalledWith('lower', 30);
  });

  it('should handle edge case with score of 0', () => {
    render(
      <HighLowChallenge
        currentPlayerName="Dave"
        lastScore={0}
        onSetChallenge={mockOnSetChallenge}
        showChallengeForm={true}
      />
    );

    expect(screen.getByText('↑ Higher than 0')).toBeInTheDocument();
    expect(screen.getByText('↓ Lower than 0')).toBeInTheDocument();

    const higherButton = screen.getByText('↑ Higher than 0');
    fireEvent.click(higherButton);

    expect(mockOnSetChallenge).toHaveBeenCalledWith('higher', 0);
  });

  it('should handle high scores correctly', () => {
    render(
      <HighLowChallenge
        currentPlayerName="Eve"
        lastScore={180}
        onSetChallenge={mockOnSetChallenge}
        showChallengeForm={true}
      />
    );

    expect(screen.getByText('↑ Higher than 180')).toBeInTheDocument();
    expect(screen.getByText('↓ Lower than 180')).toBeInTheDocument();
  });

  it('should have proper CSS classes for styling', () => {
    render(
      <HighLowChallenge
        currentPlayerName="Alice"
        lastScore={40}
        onSetChallenge={mockOnSetChallenge}
        showChallengeForm={true}
      />
    );

    const higherButton = screen.getByText('↑ Higher than 40');
    const lowerButton = screen.getByText('↓ Lower than 40');

    expect(higherButton).toHaveClass('challenge-btn', 'higher-btn');
    expect(lowerButton).toHaveClass('challenge-btn', 'lower-btn');
  });
});
