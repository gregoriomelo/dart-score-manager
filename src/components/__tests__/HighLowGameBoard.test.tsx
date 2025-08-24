import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HighLowGameBoard from '../HighLowGameBoard';
import { GameState, Player } from '../../types/game';

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
  onSubmitHighLowScore: jest.fn(),
  onSetChallenge: jest.fn(),
  onNextPlayer: jest.fn(),
  onResetGame: jest.fn(),
  onNewGame: jest.fn(),
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
    // Check for eliminated CSS class
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
