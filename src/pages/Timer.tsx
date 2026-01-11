import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Timer() {
  const navigate = useNavigate();

  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning]);

  const handleToggle = () => {
    setIsRunning(prev => !prev);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
  };

  const formatTime = (seconds: number) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="page-center">
      <div className="timer-layout">

        <div className="card timer-card">
          <div className="timer-time">{formatTime(time)}</div>

          <div className="timer-buttons">
            <button
              className={`btn ${isRunning ? 'btn-danger' : 'btn-primary'}`}
              onClick={handleToggle}
            >
              {isRunning ? '정지' : '시작'}
            </button>

            <button className="btn btn-ghost" onClick={handleReset}>
              리셋
            </button>
          </div>

          <button
            className="timer-settings-text"
            onClick={() => navigate('/settings')}
          >
            설정
          </button>
        </div>

        <div className="ai-panel">
          <div className="ai-video" />
          <div className="ai-status">미집중</div>
          <div className="ai-countdown">
            타이머 정지까지 <strong>26</strong>
          </div>
          <div className="ai-quote">
            "지금 이 순간이 가장 소중하다."
          </div>
        </div>

      </div>
    </div>
  );
}

export default Timer;