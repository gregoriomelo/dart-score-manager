import React, { useEffect, useState } from 'react';
import { GameMode } from './shared/types/game';
import { useGameManager } from './features/game/hooks/useGameManager';
import { NotificationProvider } from './app/contexts/NotificationContext';
import { LazyComponent, LazyPlayerSetup, LazyGameModeRouter } from './app/components/LazyComponents';
import NotificationContainer from './app/components/NotificationContainer';
import PerformanceDashboard from './features/performance/components/PerformanceDashboard';
import { announceToScreenReader } from './shared/utils/accessibility';
import { usePerformanceTracking } from './features/performance/utils/performance';

import { registerServiceWorker } from './utils/serviceWorker';
import { useResponsive } from './hooks/useResponsive';
import { useDeviceCapabilities } from './hooks/useTouch';
import PWAInstall from './components/PWAInstall';
import { onOnlineStatusChange } from './utils/serviceWorker';
import './App.css';

function AppContent() {
  // Performance tracking
  usePerformanceTracking('App');
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Responsive and device capabilities
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isMobile } = useResponsive();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { isTouch } = useDeviceCapabilities();
  
  // TODO: Use isMobile and isTouch for responsive design features

  // Service worker registration
  useEffect(() => {
    registerServiceWorker({
      onSuccess: () => {
        console.log('Service Worker registered successfully');
      },
      onUpdate: () => {
        console.log('Service Worker update available');
        // You could show a notification here to prompt user to update
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
        {/* Offline indicator */}
        {!isOnline && (
          <div className="offline-indicator show">
            You are currently offline. Some features may be limited.
          </div>
        )}
        
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <button
          onClick={() => setShowPerformanceDashboard(true)}
          className="performance-toggle"
          aria-label="Open performance dashboard"
          title="Performance Dashboard"
        >
          📊
        </button>
        <main id="main-content" role="main">
          <LazyComponent>
            <LazyPlayerSetup onStartGame={handleStartGame} />
          </LazyComponent>
        </main>
        <NotificationContainer />
        <PerformanceDashboard
          isVisible={showPerformanceDashboard}
          onClose={() => setShowPerformanceDashboard(false)}
        />
        <PWAInstall />
      </div>
    );
  }

  return (
    <div className="App">
      {/* Offline indicator */}
      {!isOnline && (
        <div className="offline-indicator show">
          You are currently offline. Some features may be limited.
        </div>
      )}
      
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <button
        onClick={() => setShowPerformanceDashboard(true)}
        className="performance-toggle"
        aria-label="Open performance dashboard"
        title="Performance Dashboard"
      >
        📊
      </button>
              <main id="main-content" role="main">
          <LazyComponent>
            <LazyGameModeRouter
              gameState={gameState}
              currentPlayer={currentPlayer}
              onSubmitScore={submitScore}
              onNextPlayer={goToNextPlayer}
              onResetGame={resetCurrentGame}
              onNewGame={handleNewGame}
              onSetChallenge={setChallengeForHighLow}
              onSubmitHighLowScore={submitHighLowScore}
            />
          </LazyComponent>
        </main>
      <NotificationContainer />
      <PerformanceDashboard
        isVisible={showPerformanceDashboard}
        onClose={() => setShowPerformanceDashboard(false)}
      />
      <PWAInstall />
    </div>
  );
}

function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}

export default App;
