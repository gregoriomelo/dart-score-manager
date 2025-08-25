import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlayerSetup from '../PlayerSetup';

describe('PlayerSetup', () => {
  const mockOnStartGame = jest.fn();

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
    
    expect(mockOnStartGame).toHaveBeenCalledWith(['Alice', 'Bob'], 'countdown', 301, 5);
  });

  it('filters out empty player names when starting game', async () => {
    const user = userEvent.setup();
    render(<PlayerSetup onStartGame={mockOnStartGame} />);
    
    await user.type(screen.getByPlaceholderText('Player 1 name'), 'Alice');
    await user.type(screen.getByPlaceholderText('Player 2 name'), 'Bob');
    await user.click(screen.getByText('Add Player'));
    // Leave third player name empty
    
    await user.click(screen.getByText('Start Game'));
    
    expect(mockOnStartGame).toHaveBeenCalledWith(['Alice', 'Bob'], 'countdown', 501, 5);
  });

  it('trims whitespace from player names', async () => {
    const user = userEvent.setup();
    render(<PlayerSetup onStartGame={mockOnStartGame} />);
    
    await user.type(screen.getByPlaceholderText('Player 1 name'), '  Alice  ');
    await user.type(screen.getByPlaceholderText('Player 2 name'), '  Bob  ');
    
    await user.click(screen.getByText('Start Game'));
    
    expect(mockOnStartGame).toHaveBeenCalledWith(['Alice', 'Bob'], 'countdown', 501, 5);
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
