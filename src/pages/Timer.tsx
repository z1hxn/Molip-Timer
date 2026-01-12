import { useNavigate } from 'react-router-dom';
import { useTimer } from '../features/timer/model/useTimer';

function Timer() {
  const navigate = useNavigate();
  const nickname = localStorage.getItem('nickname') || 'Guest';

  const { time, isRunning, toggle, reset, formatTime } = useTimer();

  return (
    <div className="page-center">
      <div className="timer-layout">

        <div className="card timer-card">
          <div className="timer-nickname">
            {nickname}
          </div>
          <div className="timer-time">{formatTime(time)}</div>

          <div className="timer-buttons">
            <button
              className={`btn ${isRunning ? 'btn-danger' : 'btn-primary'}`}
              onClick={toggle}
            >
              {isRunning ? '정지' : '시작'}
            </button>

            <button className="btn btn-ghost" onClick={reset}>
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
            타이머 정지까지 <strong>16</strong>
          </div>
          <div className="ai-quote">
            "지금 이 순간이 가장 소중하다"
          </div>
        </div>

      </div>
    </div>
  );
}

export default Timer;