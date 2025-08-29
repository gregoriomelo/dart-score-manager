import { useState, useCallback } from 'react';
import { validateScore } from '../../../shared/utils/validation';
import { UI_TEXT } from '../../../shared/utils/constants';
import { useNotifications } from '../../../app/contexts/NotificationContext';

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
  const { showNotification } = useNotifications();

  const handleSubmitScore = useCallback((currentPlayerId: string) => {
    if (!currentPlayerId) return;
    
    const score = parseInt(scoreInput);
    const validation = validateScore(score);
    
    if (!validation.isValid) {
      const errorMessage = validation.errorMessage || UI_TEXT.INVALID_SCORE_ERROR;
      setError(errorMessage);
      showNotification('error', errorMessage);
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
    } catch (err) {
      const errorMessage = UI_TEXT.INVALID_SCORE_ENTRY_ERROR;
      setError(errorMessage);
      showNotification('error', errorMessage);
    }
  }, [scoreInput, onSubmitScore, gameFinished, onNextPlayer, showNotification]);

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
