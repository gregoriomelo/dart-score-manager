import React from 'react';
import { Player, ScoreHistoryEntry } from '../../../shared/types/game';
import { getPlayerColor } from '../../../shared/utils/playerColors';
import './HistoryView.css';

interface HighLowHistoryTableProps {
  entries: { player?: Player; entry: ScoreHistoryEntry }[];
  showPlayerColumn: boolean;
}

const HighLowHistoryTable: React.FC<HighLowHistoryTableProps> = ({ entries, showPlayerColumn }) => {
  if (entries.length === 0) {
    return <p className="no-history">No scores recorded yet</p>;
  }

  return (
    <div className="history-table high-low">
      <div className="history-header">
        {showPlayerColumn && <span>Player</span>}
        <span>Turn</span>
        <span>Challenge</span>
        <span>Thrown</span>
        <span>Result</span>
        <span>Lives</span>
      </div>
      {entries.map((item, index) => {
        const { entry, player } = item;
        const challengeLabel = entry.challengeDirection && entry.challengeTarget !== undefined
          ? `${entry.challengeDirection === 'higher' ? 'Higher' : 'Lower'} ${entry.challengeTarget}`
          : '—';
        const resultPass = entry.passedChallenge === true;
        const resultFail = entry.passedChallenge === false;
        const livesBefore = entry.livesBefore;
        const livesAfter = entry.livesAfter;
        const eliminated = livesAfter !== undefined && livesAfter <= 0;

        return (
          <div key={`${player?.id}-${entry.turnNumber}-${index}`}
               className={`history-row ${resultFail ? 'bust' : ''}`}>
            {showPlayerColumn && player && (
              <span className="player-name-cell" style={{ color: getPlayerColor(player.id) }}>
                {player.name}
              </span>
            )}
            <span className="turn-number">{entry.turnNumber}</span>
            <span className="challenge">{challengeLabel}</span>
            <span className="score-thrown">{entry.score}</span>
            <span className="result">
              {resultPass && <span className="pass-badge">✅</span>}
              {resultFail && <span className="fail-badge">❌</span>}
              {!resultPass && !resultFail && <span>—</span>}
            </span>
            <span className="lives">
              {livesBefore !== undefined && livesAfter !== undefined ? (
                <>
                  {livesBefore} → {livesAfter}{' '}
                  {resultFail && (livesBefore || 0) > (livesAfter || 0) && (
                    <span className="lives-delta">-1 💔</span>
                  )}
                  {eliminated && <span className="eliminated-badge">☠️</span>}
                </>
              ) : (
                '—'
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default HighLowHistoryTable;
