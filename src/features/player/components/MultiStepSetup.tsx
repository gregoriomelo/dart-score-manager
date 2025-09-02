import React, { useState, useCallback } from 'react';
import { GameMode } from '../../../shared/types/game';
import { GAME_CONSTANTS } from '../../../shared/utils/constants';
import PlayersStep from './PlayersStep';
import GameModeStep from './GameModeStep';
import ConfigurationStep from './ConfigurationStep';
import ReviewStep from './ReviewStep';
import './MultiStepSetup.css';

interface MultiStepSetupProps {
  onStartGame: (playerNames: string[], gameMode: GameMode, startingScore: number, startingLives: number) => void;
}

type SetupStep = 'players' | 'gameMode' | 'configuration' | 'review';

interface SetupData {
  playerNames: string[];
  gameMode: GameMode;
  startingScore: number;
  startingLives: number;
}

const MultiStepSetup: React.FC<MultiStepSetupProps> = ({ onStartGame }) => {
  const [currentStep, setCurrentStep] = useState<SetupStep>('players');
  const [setupData, setSetupData] = useState<SetupData>({
    playerNames: ['', ''],
    gameMode: GAME_CONSTANTS.GAME_MODES.COUNTDOWN,
    startingScore: GAME_CONSTANTS.DEFAULT_STARTING_SCORE,
    startingLives: GAME_CONSTANTS.DEFAULT_STARTING_LIVES,
  });

  const updateSetupData = useCallback((updates: Partial<SetupData>) => {
    setSetupData(prev => ({ ...prev, ...updates }));
  }, []);

  const goToNextStep = useCallback(() => {
    const steps: SetupStep[] = ['players', 'gameMode', 'configuration', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  }, [currentStep]);

  const goToPreviousStep = useCallback(() => {
    const steps: SetupStep[] = ['players', 'gameMode', 'configuration', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  }, [currentStep]);

  const resetSetup = useCallback(() => {
    setSetupData({
      playerNames: ['', ''],
      gameMode: GAME_CONSTANTS.GAME_MODES.COUNTDOWN,
      startingScore: GAME_CONSTANTS.DEFAULT_STARTING_SCORE,
      startingLives: GAME_CONSTANTS.DEFAULT_STARTING_LIVES,
    });
    setCurrentStep('players');
  }, []);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'players':
        return (
          <PlayersStep
            playerNames={setupData.playerNames}
            onUpdatePlayerNames={(names) => updateSetupData({ playerNames: names })}
            onNext={goToNextStep}
          />
        );
      case 'gameMode':
        return (
          <GameModeStep
            gameMode={setupData.gameMode}
            onUpdateGameMode={(mode) => updateSetupData({ gameMode: mode })}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            onReset={resetSetup}
          />
        );
      case 'configuration':
        return (
          <ConfigurationStep
            gameMode={setupData.gameMode}
            startingScore={setupData.startingScore}
            startingLives={setupData.startingLives}
            onUpdateScore={(score) => updateSetupData({ startingScore: score })}
            onUpdateLives={(lives) => updateSetupData({ startingLives: lives })}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            onReset={resetSetup}
          />
        );
      case 'review':
        return (
          <ReviewStep
            setupData={setupData}
            onStartGame={onStartGame}
            onBack={goToPreviousStep}
            onReset={resetSetup}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="multi-step-setup">
      {renderCurrentStep()}
    </div>
  );
};

export default MultiStepSetup;
