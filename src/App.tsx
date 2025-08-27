import React from 'react';
import { GameMode } from './types/game';
import { useGame } from './hooks/useGame';
import PlayerSetup from './components/PlayerSetup';
import GameBoard from './components/GameBoard';
import './App.css';

function App() {
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
  } = useGame();

  const handleStartGame = (playerNames: string[], gameMode: GameMode, startingScore: number, startingLives: number) => {
    initializeGame(playerNames, gameMode, startingScore, startingLives);
    startNewGame();
  };

  const handleNewGame = () => {
    clearStoredGame();
  };

  if (gameState.players.length === 0) {
    return <PlayerSetup onStartGame={handleStartGame} />;
  }

  return (
    <div className="App">
      <GameBoard
        gameState={gameState}
        currentPlayer={currentPlayer}
        onSubmitScore={submitScore}
        onNextPlayer={goToNextPlayer}
        onResetGame={resetCurrentGame}
        onNewGame={handleNewGame}
        onSetChallenge={setChallengeForHighLow}
        onSubmitHighLowScore={submitHighLowScore}
      />
    </div>
  );
}

export default App;
