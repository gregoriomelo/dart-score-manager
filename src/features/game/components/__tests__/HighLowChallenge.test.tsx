import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import { vi } from 'vitest';
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
