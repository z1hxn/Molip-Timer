type TimerPanelProps = {
  nickname: string;
  totalTime: number;
  focusTime: number;
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onOpenSettings: () => void;
  formatTime: (seconds: number) => string;
};

function TimerPanel({
  nickname,
  totalTime,
  focusTime,
  isRunning,
  onToggle,
  onReset,
  onOpenSettings,
  formatTime,
}: TimerPanelProps) {
  return (
    <div className="card timer-card fixed-panel">
      <div className="timer-nickname">{nickname}</div>

      <div style={{ marginBottom: '1rem', color: '#6c757d' }}>
        <small>총 경과 시간</small>
        <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{formatTime(totalTime)}</div>
      </div>

      <div style={{ color: '#6c757d' }}>
        <small>몰입 시간</small>
      </div>
      <div className="timer-time">{formatTime(focusTime)}</div>

      <div className="timer-buttons">
        <button className={`btn ${isRunning ? 'btn-danger' : 'btn-primary'}`} onClick={onToggle}>
          {isRunning ? '몰입 정지' : totalTime > 0 ? '몰입 재시작' : '몰입 시작'}
        </button>

        {!isRunning && totalTime > 0 && (
          <button className="btn btn-ghost" onClick={onReset}>
            종료
          </button>
        )}
      </div>

      <button className="timer-settings-text" onClick={onOpenSettings}>
        설정
      </button>
    </div>
  );
}

export default TimerPanel;
