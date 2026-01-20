import type { RefObject } from 'react';

type AiPanelProps = {
  isRunning: boolean;
  isSystemState: boolean;
  showStartHint: boolean;
  aiStatus: string;
  aiConfidence: number | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  countdownSeconds: number;
  formatCountdown: (seconds: number) => string;
};

function AiPanel({
  isRunning,
  isSystemState,
  showStartHint,
  aiStatus,
  aiConfidence,
  videoRef,
  canvasRef,
  countdownSeconds,
  formatCountdown,
}: AiPanelProps) {
  return (
    <div className="card timer-card fixed-media">
      <div className="video-wrapper">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`ai-video ${isRunning ? '' : 'is-idle'}`}
        />
        <canvas ref={canvasRef} className={`ai-canvas ${isRunning ? '' : 'is-hidden'}`} />
        {!isRunning && !isSystemState && showStartHint && (
          <div className="ai-start-overlay">
            <div className="ai-overlay-title">타이머를 시작해 주세요</div>
            <div className="ai-overlay-sub">시작하면 몰입 상태를 판독하고 스켈레톤을 표시합니다.</div>
          </div>
        )}
        {isRunning && !isSystemState && (
          <div className={`ai-status-badge ${aiStatus === '몰입 중' ? 'status-focused' : 'status-unfocused'}`}>
            {aiStatus}
          </div>
        )}
      </div>
      <div className="ai-guide">
        얼굴·상체가 프레임 중앙에 들어오고, 책상 높이보다 약간 위 각도에서 촬영하면 정확도가 높아요.
      </div>
      <div className="ai-confidence">
        <small>AI 집중도</small>
        <div style={{ fontSize: '1rem', fontWeight: 600 }}>
          {aiConfidence === null ? '--' : `${(aiConfidence * 100).toFixed(1)}%`}
        </div>
      </div>
      <div className={`countdown-slot ${isRunning && aiStatus === '미집중' ? 'is-active' : 'is-hidden'}`}>
        <div className="ai-countdown-card">
          <div className="ai-countdown-label">타이머 정지까지</div>
          <div className="ai-countdown-value">{formatCountdown(countdownSeconds)}</div>
        </div>
      </div>
    </div>
  );
}

export default AiPanel;
