import React from 'react';
import { useGameState } from './hooks/useGameState';
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
  } = useGameState();

  const handleStartGame = (playerNames: string[], startingScore: number) => {
    initializeGame(playerNames, startingScore);
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
      />
    </div>
  );
}

export default App;
