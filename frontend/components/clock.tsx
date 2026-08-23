'use client';

import { useEffect, useState } from 'react';

type Player = 'white' | 'black';

interface ClockState {
  whiteTime: number;
  blackTime: number;
  activePlayer: Player;
  lastMoveTimestamp: number;
}

interface Props {
  clock: ClockState;
  serverTimeOffset: number;
  player: Player; // which side to display
}

export default function ChessClock({ clock, serverTimeOffset, player }: Props) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const getRemainingTime = (p: Player) => {
    let baseTime = p === 'white' ? clock.whiteTime : clock.blackTime;

    if (clock.activePlayer === p) {
      const elapsed = now + serverTimeOffset - clock.lastMoveTimestamp;
      baseTime -= elapsed;
    }

    return Math.max(0, baseTime);
  };

  const format = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const isActive = clock.activePlayer === player;
  const time = format(getRemainingTime(player));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Azeret+Mono:wght@300;600;800&display=swap');

        .chess-clock-inline {
          display: inline-flex;
          align-items: center;
          font-family: 'Azeret Mono', monospace;
          background: #0d0d0d;
          border: 1px solid #2a2a2a;
          border-radius: 4px;
          padding: 6px 14px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
          transition: background 0.2s ease;
          position: relative;
          gap: 8px;
        }

        .chess-clock-inline.active {
          background: #1a1a1a;
          border-color: #3a3a3a;
        }

        .chess-clock-inline .clock-time {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #888;
          transition: color 0.2s ease;
        }

        .chess-clock-inline.active .clock-time {
          color: #ffffff;
        }

        .chess-clock-inline .clock-pip {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          opacity: 0;
          flex-shrink: 0;
          transition: opacity 0.2s ease;
        }

        .chess-clock-inline.active .clock-pip {
          opacity: 1;
          animation: pip-pulse 1s ease-in-out infinite;
        }

        .chess-clock-inline.white-pip .clock-pip {
          background: #4ecc94;
          box-shadow: 0 0 6px #4ecc94;
        }

        .chess-clock-inline.black-pip .clock-pip {
          background: #ff4e4e;
          box-shadow: 0 0 6px #ff4e4e;
        }

        @keyframes pip-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.6); opacity: 0.5; }
        }
      `}</style>

      <div className={`chess-clock-inline ${isActive ? 'active' : ''} ${player}-pip`}>
        <span className="clock-pip" />
        <span className="clock-time">{time}</span>
      </div>
    </>
  );
}