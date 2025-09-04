import { useState, useCallback } from 'react';
import { validateScore } from '../../../shared/utils/validation';
import { UI_TEXT } from '../../../shared/utils/constants';
// Remove the useNotifications hook since we don't want popup notifications

interface UseScoreSubmissionProps {
  onSubmitScore: (playerId: string, score: number) => void;
  onNextPlayer?: () => void;
  gameFinished?: boolean;
}

export const useScoreSubmission = ({
  onSubmitScore,
  onNextPlayer,
  gameFinished = false
}: UseScoreSubmissionProps) => {
  const [scoreInput, setScoreInput] = useState<string>('');
  const [error, setError] = useState<string>('');
  // Remove the useNotifications hook since we don't want popup notifications

  const handleSubmitScore = useCallback((currentPlayerId: string) => {
    if (!currentPlayerId) return;
    
    const score = parseInt(scoreInput, 10);
    const validation = validateScore(score);
    
    if (!validation.isValid) {
      const errorMessage = validation.errorMessage || UI_TEXT.INVALID_SCORE_ERROR;
      setError(errorMessage);
      // Remove the showNotification call - keep only the inline error
      return;
    }

    try {
      onSubmitScore(currentPlayerId, score);
      setScoreInput('');
      setError('');
      
      // Auto advance to next player immediately if game isn't finished
      if (!gameFinished && onNextPlayer) {
        onNextPlayer();
      }
    } catch {
      const errorMessage = UI_TEXT.INVALID_SCORE_ENTRY_ERROR;
      setError(errorMessage);
      // Remove the showNotification call - keep only the inline error
    }
  }, [scoreInput, onSubmitScore, gameFinished, onNextPlayer]);

  const handleScoreInputChange = useCallback((value: string) => {
    setScoreInput(value);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  }, [error]);

  const resetScoreInput = useCallback(() => {
    setScoreInput('');
    setError('');
  }, []);

  return {
    scoreInput,
    error,
    handleSubmitScore,
    handleScoreInputChange,
    resetScoreInput,
    setError
  };
};
