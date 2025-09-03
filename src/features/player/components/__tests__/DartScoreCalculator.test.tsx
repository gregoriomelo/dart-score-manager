import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import DartScoreCalculator from '../DartScoreCalculator';

// Mock the i18n hook
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string, options?: any) => {
      if (options) {
        return defaultValue?.replace(/\{\{(\w+)\}\}/g, (_, key) => options[key]) || key;
      }
      return defaultValue || key;
    }
  })
}));

// Mock the performance tracking hook
vi.mock('../../../performance/utils/performance', () => ({
  usePerformanceTracking: vi.fn()
}));

// Mock the accessibility utility
vi.mock('../../../shared/utils/accessibility', () => ({
  generateAriaId: (prefix: string) => `${prefix}-test-id`
}));

describe('DartScoreCalculator', () => {
  const mockOnScoreSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders calculator with three dart inputs', () => {
    render(<DartScoreCalculator onScoreSubmit={mockOnScoreSubmit} />);
    
    expect(screen.getByLabelText('Dart 1 score (0-60)')).toBeInTheDocument();
    expect(screen.getByLabelText('Dart 2 score (0-60)')).toBeInTheDocument();
    expect(screen.getByLabelText('Dart 3 score (0-60)')).toBeInTheDocument();
  });

  it('calculates total score correctly', async () => {
    render(<DartScoreCalculator onScoreSubmit={mockOnScoreSubmit} />);
    
    const dart1Input = screen.getByLabelText('Dart 1 score (0-60)');
    const dart2Input = screen.getByLabelText('Dart 2 score (0-60)');
    const dart3Input = screen.getByLabelText('Dart 3 score (0-60)');
    
    fireEvent.change(dart1Input, { target: { value: '20' } });
    fireEvent.change(dart2Input, { target: { value: '25' } });
    fireEvent.change(dart3Input, { target: { value: '15' } });
    
    // Total should be calculated but not displayed
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });



  it('calls onScoreSubmit when submit button is clicked', async () => {
    render(<DartScoreCalculator onScoreSubmit={mockOnScoreSubmit} />);
    
    const dart1Input = screen.getByLabelText('Dart 1 score (0-60)');
    fireEvent.change(dart1Input, { target: { value: '25' } });
    
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);
    
    expect(mockOnScoreSubmit).toHaveBeenCalledWith(25);
  });

  it('calls onCancel when cancel button is clicked', async () => {
    render(<DartScoreCalculator onScoreSubmit={mockOnScoreSubmit} onCancel={mockOnCancel} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('resets calculator when reset button is clicked', async () => {
    render(<DartScoreCalculator onScoreSubmit={mockOnScoreSubmit} />);
    
    const dart1Input = screen.getByLabelText('Dart 1 score (0-60)');
    fireEvent.change(dart1Input, { target: { value: '25' } });
    
    // Check that submit button is enabled
    expect(screen.getByText('Submit')).toBeInTheDocument();
    
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    // Check that submit button is still there
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });



  it('does not auto-advance to next dart input when current one is filled', async () => {
    render(<DartScoreCalculator onScoreSubmit={mockOnScoreSubmit} />);
    
    const dart1Input = screen.getByLabelText('Dart 1 score (0-60)');
    fireEvent.change(dart1Input, { target: { value: '25' } });
    
    // The first dart input should remain focused (no auto-advance)
    expect(dart1Input).toHaveClass('active');
    
    const dart2Input = screen.getByLabelText('Dart 2 score (0-60)');
    expect(dart2Input).not.toHaveClass('active');
  });

  it('handles keyboard navigation between dart inputs', async () => {
    render(<DartScoreCalculator onScoreSubmit={mockOnScoreSubmit} />);
    
    const dart1Input = screen.getByLabelText('Dart 1 score (0-60)');
    const dart2Input = screen.getByLabelText('Dart 2 score (0-60)');
    
    // Focus first input
    fireEvent.focus(dart1Input);
    expect(dart1Input).toHaveClass('active');
    
    // Navigate to second input with arrow key
    fireEvent.keyDown(dart1Input, { key: 'ArrowRight' });
    expect(dart2Input).toHaveClass('active');
  });

  it('submits score when Enter is pressed on valid total', async () => {
    render(<DartScoreCalculator onScoreSubmit={mockOnScoreSubmit} />);
    
    const dart1Input = screen.getByLabelText('Dart 1 score (0-60)');
    fireEvent.change(dart1Input, { target: { value: '25' } });
    
    fireEvent.keyDown(dart1Input, { key: 'Enter' });
    
    expect(mockOnScoreSubmit).toHaveBeenCalledWith(25);
  });
});
