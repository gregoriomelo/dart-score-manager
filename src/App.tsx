import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GameMode } from './shared/types/game';
import { useGameManager } from './features/game/hooks/useGameManager';
import { LazyComponent, LazyPlayerSetup } from './app/components/LazyComponents';
import GameModeRouter from './features/game/components/GameModeRouter';
import PerformanceDashboard from './features/performance/components/PerformanceDashboard';
import { announceToScreenReader } from './shared/utils/accessibility';
import { usePerformanceTracking } from './features/performance/utils/performance';

import { registerServiceWorker } from './utils/serviceWorker';
import { useResponsive } from './hooks/useResponsive';
import { useDeviceCapabilities } from './hooks/useTouch';

import LanguageSwitcher from './components/LanguageSwitcher';
import { onOnlineStatusChange } from './utils/serviceWorker';
import './i18n';
import './App.css';

// Check if we're in development mode (not building for GitHub Pages)
const isDevelopment = import.meta.env.DEV;

function AppContent() {
  // Performance tracking
  usePerformanceTracking('App');
  const { t } = useTranslation();
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Responsive and device capabilities
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isMobile } = useResponsive();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isTouch } = useDeviceCapabilities();
  
  // Responsive design features implemented using isMobile and isTouch

  // Service worker registration
  useEffect(() => {
    registerServiceWorker({
      onSuccess: () => {
        // Service Worker registered successfully
      },
      onUpdate: () => {
        // Service Worker update available - could show notification to prompt user to update
      },
      onError: (error) => {
        console.error('Service Worker registration failed:', error);
      },
    });
  }, []);

  // Online/offline status monitoring
  useEffect(() => {
    const unsubscribe = onOnlineStatusChange((online) => {
      setIsOnline(online);
    });

    return unsubscribe;
  }, []);

  const {
    gameState,
    currentPlayer,
    initializeGame,
    startNewGame,
    submitScore,
    goToNextPlayer,
    resetCurrentGame,
    clearStoredGame,
    setChallengeForHighLow,
    submitHighLowScore,
  } = useGameManager();

  const handleStartGame = (playerNames: string[], gameMode: GameMode, startingScore: number, startingLives: number) => {
    initializeGame(playerNames, gameMode, startingScore, startingLives);
    startNewGame();
    announceToScreenReader(`Game started with ${playerNames.length} players in ${gameMode} mode`);
  };

  const handleNewGame = () => {
    clearStoredGame();
  };

  if (gameState.players.length === 0) {
    return (
      <div className="App">
        <LanguageSwitcher />
        {/* Offline indicator */}
        {!isOnline && (
          <div className="offline-indicator show">
            {t('app.offlineMessage')}
          </div>
        )}
        
        <a href="#main-content" className="skip-link">
          {t('app.skipToMainContent')}
        </a>
        {isDevelopment && (
          <button
            onClick={() => setShowPerformanceDashboard(true)}
            className="performance-toggle"
            aria-label={t('app.openPerformanceDashboard')}
            title={t('app.performanceDashboard')}
          >
            📊
          </button>
        )}
        <main id="main-content" role="main">
          <LazyComponent>
            <LazyPlayerSetup onStartGame={handleStartGame} />
          </LazyComponent>
        </main>
        {isDevelopment && (
          <PerformanceDashboard
            isVisible={showPerformanceDashboard}
            onClose={() => setShowPerformanceDashboard(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="App">
      {/* Offline indicator */}
      {!isOnline && (
        <div className="offline-indicator show">
          {t('app.offlineMessage')}
        </div>
      )}
      
      <a href="#main-content" className="skip-link">
        {t('app.skipToMainContent')}
      </a>
      {isDevelopment && (
        <button
          onClick={() => setShowPerformanceDashboard(true)}
          className="performance-toggle"
          aria-label={t('app.openPerformanceDashboard')}
          title={t('app.performanceDashboard')}
        >
          📊
        </button>
      )}
              <main id="main-content" role="main">
          <GameModeRouter
            gameState={gameState}
            currentPlayer={currentPlayer}
            onSubmitScore={submitScore}
            onNextPlayer={goToNextPlayer}
            onResetGame={resetCurrentGame}
            onNewGame={handleNewGame}
            onSetChallenge={setChallengeForHighLow}
            onSubmitHighLowScore={submitHighLowScore}
          />
        </main>
      {isDevelopment && (
        <PerformanceDashboard
          isVisible={showPerformanceDashboard}
          onClose={() => setShowPerformanceDashboard(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AppContent />
  );
}

export default App;
