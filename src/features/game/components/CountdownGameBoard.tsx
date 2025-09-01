import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Player, CountdownGameState, CountdownPlayer } from '../../../shared/types/game';
import { UI_TEXT, CSS_CLASSES } from '../../../shared/utils/constants';
import { useScoreSubmission } from '../../player/hooks/useScoreSubmission';
import { formatCountdownModeIndicator } from '../../../shared/utils/textUtils';
import CountdownPlayerHistoryModal from '../../history/components/CountdownPlayerHistoryModal';
import CountdownAllPlayersHistoryModal from '../../history/components/CountdownAllPlayersHistoryModal';
import PlayerList from '../../player/components/PlayerList';
import GameActions from './GameActions';
import WinnerAnnouncement from './WinnerAnnouncement';
import ScoreInput from '../../player/components/ScoreInput';
import './GameBoard.css';

interface CountdownGameBoardProps {
  gameState: CountdownGameState;
  currentPlayer: CountdownPlayer | null;
  onSubmitScore: (playerId: string, score: number) => void;
  onNextPlayer: () => void;
  onResetGame: () => void;
  onNewGame: () => void;
}

const CountdownGameBoard: React.FC<CountdownGameBoardProps> = React.memo(({
  gameState,
  currentPlayer,
  onSubmitScore,
  onNextPlayer,
  onResetGame,
  onNewGame,
}) => {
  const [historyPlayer, setHistoryPlayer] = useState<Player | null>(null);
  const [showConsolidatedHistory, setShowConsolidatedHistory] = useState(false);
  const [showBustBanner, setShowBustBanner] = useState(false);
  const [bustAnimKey, setBustAnimKey] = useState(0);

  const {
    scoreInput,
    error,
    handleSubmitScore,
    handleScoreInputChange
  } = useScoreSubmission({
    onSubmitScore,
    onNextPlayer,
    gameFinished: gameState.gameFinished
  });

  // Incrementing counter that changes whenever any score entry is added.
  // This lets us re-trigger the bust banner even if the bust flag remains true.
  const historyVersion = useMemo(
    () => gameState.players.reduce((acc, p) => acc + p.scoreHistory.length, 0),
    [gameState.players]
  );

  // When a bust occurs, show the banner and auto-dismiss after a short delay,
  // but allow it to be visible at the start of the next player's turn.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (gameState.lastThrowWasBust) {
      setShowBustBanner(true);
      setBustAnimKey((k) => k + 1);
      timer = setTimeout(() => setShowBustBanner(false), 2000);
    } else {
      setShowBustBanner(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [gameState.lastThrowWasBust, currentPlayer?.id, historyVersion]);

  const handleScoreSubmit = useCallback(() => {
    if (currentPlayer) {
      handleSubmitScore(currentPlayer.id);
    }
  }, [currentPlayer, handleSubmitScore]);

  if (gameState.gameFinished && gameState.winner) {
    return (
      <>
        <WinnerAnnouncement
          winner={gameState.winner}
          players={gameState.players}
          gameMode="countdown"
          onHistoryClick={setHistoryPlayer}
          onShowAllHistory={() => setShowConsolidatedHistory(true)}
          onResetGame={onResetGame}
          onNewGame={onNewGame}
        />
        
        <CountdownPlayerHistoryModal 
          player={historyPlayer! as CountdownPlayer}
          isOpen={historyPlayer !== null}
          onClose={() => setHistoryPlayer(null)}
        />
        
        <CountdownAllPlayersHistoryModal 
          players={gameState.players as CountdownPlayer[]}
          isOpen={showConsolidatedHistory}
          onClose={() => setShowConsolidatedHistory(false)}
        />
      </>
    );
  }

  return (
    <>
      <div className={CSS_CLASSES.GAME_BOARD}>
        <h1>{UI_TEXT.APP_TITLE}</h1>
        <div className={CSS_CLASSES.GAME_MODE_INDICATOR}>
          {formatCountdownModeIndicator(gameState.players[0]?.turnStartScore || 501)}
        </div>
        
        <PlayerList
          players={gameState.players}
          currentPlayer={currentPlayer}
          gameMode="countdown"
          onHistoryClick={setHistoryPlayer}
        />

        {currentPlayer && (
          <ScoreInput
            currentPlayer={currentPlayer}
            scoreInput={scoreInput}
            onScoreInputChange={handleScoreInputChange}
            onSubmitScore={handleScoreSubmit}
            error={error}
            showBustBanner={showBustBanner}
            bustAnimKey={bustAnimKey}
          />
        )}
        
        <GameActions
          onShowAllHistory={() => setShowConsolidatedHistory(true)}
          onResetGame={onResetGame}
          onNewGame={onNewGame}
        />
      </div>

      {/* History modals - always rendered so they're available during the game */}
      <CountdownPlayerHistoryModal 
        player={historyPlayer! as CountdownPlayer}
        isOpen={historyPlayer !== null}
        onClose={() => setHistoryPlayer(null)}
      />
      
      <CountdownAllPlayersHistoryModal 
        players={gameState.players as CountdownPlayer[]}
        isOpen={showConsolidatedHistory}
        onClose={() => setShowConsolidatedHistory(false)}
      />
    </>
  );
});

export default CountdownGameBoard;
