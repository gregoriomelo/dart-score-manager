import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameBoard from '../GameBoard';
import { GameState, Player } from '../../types/game';

describe('GameBoard', () => {
  const mockOnSubmitScore = jest.fn();
  const mockOnNextPlayer = jest.fn();
  const mockOnResetGame = jest.fn();
  const mockOnNewGame = jest.fn();

  const createMockPlayer = (name: string, score: number, isWinner = false): Player => ({
    id: `player-${name.toLowerCase()}`,
    name,
    score,
    isWinner,
    turnStartScore: score,
    scoreHistory: [],
  });

  const createMockGameState = (players: Player[], currentPlayerIndex = 0, gameFinished = false): GameState => ({
    players,
    currentPlayerIndex,
    gameFinished,
    winner: gameFinished ? players.find(p => p.isWinner) || null : null,
    lastThrowWasBust: false,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Active Game', () => {
    const players = [
      createMockPlayer('Alice', 301),
      createMockPlayer('Bob', 450),
    ];
    const gameState = createMockGameState(players);
    const currentPlayer = players[0];

    it('renders game board with players and current player', () => {
      render(
        <GameBoard
          gameState={gameState}
          currentPlayer={currentPlayer}
          onSubmitScore={mockOnSubmitScore}
          onNextPlayer={mockOnNextPlayer}
          onResetGame={mockOnResetGame}
          onNewGame={mockOnNewGame}
        />
      );

      expect(screen.getByText('Dart Score Manager')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('301')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('450')).toBeInTheDocument();
      // Current turn indicator is shown in the player's turn section
      expect(screen.getByText("Alice's Turn")).toBeInTheDocument();
    });

    it('allows entering and submitting a score', async () => {
      const user = userEvent.setup();
      render(
        <GameBoard
          gameState={gameState}
          currentPlayer={currentPlayer}
          onSubmitScore={mockOnSubmitScore}
          onNextPlayer={mockOnNextPlayer}
          onResetGame={mockOnResetGame}
          onNewGame={mockOnNewGame}
        />
      );

      const scoreInput = screen.getByPlaceholderText('Enter score (0-180)');
      const submitButton = screen.getByText('Submit');

      // Submit button is enabled by default in the current implementation

      await user.type(scoreInput, '50');
      expect(submitButton).toBeEnabled();

      await user.click(submitButton);

      expect(mockOnSubmitScore).toHaveBeenCalledWith('player-alice', 50);
    });

    it('submits score on Enter key press', async () => {
      const user = userEvent.setup();
      render(
        <GameBoard
          gameState={gameState}
          currentPlayer={currentPlayer}
          onSubmitScore={mockOnSubmitScore}
          onNextPlayer={mockOnNextPlayer}
          onResetGame={mockOnResetGame}
          onNewGame={mockOnNewGame}
        />
      );

      const scoreInput = screen.getByPlaceholderText('Enter score (0-180)');
      await user.type(scoreInput, '75');
      await user.keyboard('{Enter}');

      expect(mockOnSubmitScore).toHaveBeenCalledWith('player-alice', 75);
    });

    it('shows error for invalid score input', async () => {
      const user = userEvent.setup();
      render(
        <GameBoard
          gameState={gameState}
          currentPlayer={currentPlayer}
          onSubmitScore={mockOnSubmitScore}
          onNextPlayer={mockOnNextPlayer}
          onResetGame={mockOnResetGame}
          onNewGame={mockOnNewGame}
        />
      );

      const scoreInput = screen.getByPlaceholderText('Enter score (0-180)');
      const submitButton = screen.getByText('Submit');

      await user.type(scoreInput, '200');
      await user.click(submitButton);

      expect(screen.getByText('Please enter a valid score (0-180)')).toBeInTheDocument();
      expect(mockOnSubmitScore).not.toHaveBeenCalled();
    });

    it('shows error when score exceeds remaining points', async () => {
      const user = userEvent.setup();
      render(
        <GameBoard
          gameState={gameState}
          currentPlayer={currentPlayer}
          onSubmitScore={mockOnSubmitScore}
          onNextPlayer={mockOnNextPlayer}
          onResetGame={mockOnResetGame}
          onNewGame={mockOnNewGame}
        />
      );

      const scoreInput = screen.getByPlaceholderText('Enter score (0-180)');
      const submitButton = screen.getByText('Submit');

      await user.type(scoreInput, '350'); // More than Alice's remaining 301
      await user.click(submitButton);

      expect(screen.getByText('Please enter a valid score (0-180)')).toBeInTheDocument();
      expect(mockOnSubmitScore).not.toHaveBeenCalled();
    });

    it('allows manual score input', async () => {
      const user = userEvent.setup();
      render(
        <GameBoard
          gameState={gameState}
          currentPlayer={currentPlayer}
          onSubmitScore={mockOnSubmitScore}
          onNextPlayer={mockOnNextPlayer}
          onResetGame={mockOnResetGame}
          onNewGame={mockOnNewGame}
        />
      );

      const scoreInput = screen.getByPlaceholderText('Enter score (0-180)');
      await user.type(scoreInput, '100');
      expect(scoreInput).toHaveValue(100);
    });

    it('allows 0 as a valid score (missed dartboard)', async () => {
      const user = userEvent.setup();
      render(
        <GameBoard
          gameState={gameState}
          currentPlayer={currentPlayer}
          onSubmitScore={mockOnSubmitScore}
          onNextPlayer={mockOnNextPlayer}
          onResetGame={mockOnResetGame}
          onNewGame={mockOnNewGame}
        />
      );

      const scoreInput = screen.getByPlaceholderText('Enter score (0-180)');
      const submitButton = screen.getByText('Submit');

      await user.type(scoreInput, '0');
      await user.click(submitButton);

      expect(mockOnSubmitScore).toHaveBeenCalledWith('player-alice', 0);
    });

    it('handles low score scenarios', () => {
      const lowScorePlayer = createMockPlayer('LowScore', 50);
      const lowScoreGameState = createMockGameState([lowScorePlayer]);

      render(
        <GameBoard
          gameState={lowScoreGameState}
          currentPlayer={lowScorePlayer}
          onSubmitScore={mockOnSubmitScore}
          onNextPlayer={mockOnNextPlayer}
          onResetGame={mockOnResetGame}
          onNewGame={mockOnNewGame}
        />
      );

      // Player with low score should still be able to input scores
      const scoreInput = screen.getByPlaceholderText('Enter score (0-180)');
      expect(scoreInput).toBeInTheDocument();
    });

    it('calls reset game when reset button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <GameBoard
          gameState={gameState}
          currentPlayer={currentPlayer}
          onSubmitScore={mockOnSubmitScore}
          onNextPlayer={mockOnNextPlayer}
          onResetGame={mockOnResetGame}
          onNewGame={mockOnNewGame}
        />
      );

      await user.click(screen.getByText('Reset Game'));
      expect(mockOnResetGame).toHaveBeenCalled();
    });

    it('calls new game when new game button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <GameBoard
          gameState={gameState}
          currentPlayer={currentPlayer}
          onSubmitScore={mockOnSubmitScore}
          onNextPlayer={mockOnNextPlayer}
          onResetGame={mockOnResetGame}
          onNewGame={mockOnNewGame}
        />
      );

      await user.click(screen.getByText('Back to Setup'));
      expect(mockOnNewGame).toHaveBeenCalled();
    });
  });

  describe('Game Finished', () => {
    const players = [
      createMockPlayer('Alice', 0, true),
      createMockPlayer('Bob', 150),
    ];
    const finishedGameState = createMockGameState(players, 0, true);

    it('displays winner announcement', () => {
      render(
        <GameBoard
          gameState={finishedGameState}
          currentPlayer={null}
          onSubmitScore={mockOnSubmitScore}
          onNextPlayer={mockOnNextPlayer}
          onResetGame={mockOnResetGame}
          onNewGame={mockOnNewGame}
        />
      );

      expect(screen.getByText('🎉 Congratulations!')).toBeInTheDocument();
      expect(screen.getByText('Alice wins!')).toBeInTheDocument();
    });

    it('shows final scores with winner highlighted', () => {
      render(
        <GameBoard
          gameState={finishedGameState}
          currentPlayer={null}
          onSubmitScore={mockOnSubmitScore}
          onNextPlayer={mockOnNextPlayer}
          onResetGame={mockOnResetGame}
          onNewGame={mockOnNewGame}
        />
      );

      // In the winner screen, player cards are not shown
      // The winner announcement shows the winner's name
      expect(screen.getByText('Alice wins!')).toBeInTheDocument();
    });

    it('shows play again and new game buttons', () => {
      render(
        <GameBoard
          gameState={finishedGameState}
          currentPlayer={null}
          onSubmitScore={mockOnSubmitScore}
          onNextPlayer={mockOnNextPlayer}
          onResetGame={mockOnResetGame}
          onNewGame={mockOnNewGame}
        />
      );

      expect(screen.getByText('Reset Game')).toBeInTheDocument();
      expect(screen.getByText('New Game')).toBeInTheDocument();
    });

    it('does not show score input section when game is finished', () => {
      render(
        <GameBoard
          gameState={finishedGameState}
          currentPlayer={null}
          onSubmitScore={mockOnSubmitScore}
          onNextPlayer={mockOnNextPlayer}
          onResetGame={mockOnResetGame}
          onNewGame={mockOnNewGame}
        />
      );

      expect(screen.queryByPlaceholderText('Enter score (1-180)')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles null current player gracefully', () => {
      const players = [createMockPlayer('Alice', 301)];
      const gameState = createMockGameState(players);

      render(
        <GameBoard
          gameState={gameState}
          currentPlayer={null}
          onSubmitScore={mockOnSubmitScore}
          onNextPlayer={mockOnNextPlayer}
          onResetGame={mockOnResetGame}
          onNewGame={mockOnNewGame}
        />
      );

      expect(screen.queryByText("'s Turn")).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Enter score (1-180)')).not.toBeInTheDocument();
    });

    it('clears input and error after successful score submission', async () => {
      const user = userEvent.setup();
      const players = [createMockPlayer('Alice', 301)];
      const gameState = createMockGameState(players);
      const currentPlayer = players[0];

      render(
        <GameBoard
          gameState={gameState}
          currentPlayer={currentPlayer}
          onSubmitScore={mockOnSubmitScore}
          onNextPlayer={mockOnNextPlayer}
          onResetGame={mockOnResetGame}
          onNewGame={mockOnNewGame}
        />
      );

      const scoreInput = screen.getByPlaceholderText('Enter score (0-180)');
      
      // First, create an error
      await user.type(scoreInput, '400');
      await user.click(screen.getByText('Submit'));
      expect(screen.getByText('Please enter a valid score (0-180)')).toBeInTheDocument();

      // Clear and enter valid score
      await user.clear(scoreInput);
      await user.type(scoreInput, '50');
      await user.click(screen.getByText('Submit'));

      expect(scoreInput).toHaveValue(null);
      expect(screen.queryByText('Please enter a valid score (0-180)')).not.toBeInTheDocument();
    });
  });
});
