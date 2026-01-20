import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AiPanel,
  MotivationFooter,
  TimerAlerts,
  TimerPanel,
  useAiPose,
  useAutoStopCountdown,
  usePauseSettings,
  useTimer,
} from '@features/timer';

function TimerWorkspace() {
  const navigate = useNavigate();
  const nickname = localStorage.getItem('nickname') || 'Guest';

  const [showAiAlert, setShowAiAlert] = useState(true);
  const [showStartHint] = useState(true);
  const [focusActive, setFocusActive] = useState(false);
  const { pauseSeconds, motivationText } = usePauseSettings();
  const { focusTime, totalTime, isRunning, toggle, reset, stop, formatTime } = useTimer(focusActive);
  const { aiStatus, aiConfidence, videoRef, canvasRef, isSystemState } = useAiPose(isRunning);

  const formatCountdown = (seconds: number) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const { countdownSeconds, showAutoStopAlert, setShowAutoStopAlert } = useAutoStopCountdown({
    isRunning,
    aiStatus,
    pauseSeconds,
    onAutoStop: stop,
  });

  useEffect(() => {
    setShowAiAlert(true);
  }, [aiStatus]);

  useEffect(() => {
    setFocusActive(aiStatus === '몰입 중');
  }, [aiStatus]);

  return (
    <div className="page-center" style={{ flexDirection: 'column' }}>
      <TimerAlerts
        isSystemState={isSystemState}
        showAutoStopAlert={showAutoStopAlert}
        onCloseAutoStop={() => setShowAutoStopAlert(false)}
        showAiAlert={showAiAlert}
        onCloseAiAlert={() => setShowAiAlert(false)}
        aiStatus={aiStatus}
      />

      <div className="timer-layout">
        <TimerPanel
          nickname={nickname}
          totalTime={totalTime}
          focusTime={focusTime}
          isRunning={isRunning}
          onToggle={toggle}
          onReset={reset}
          onOpenSettings={() => navigate('/settings')}
          formatTime={formatTime}
        />
        <AiPanel
          isRunning={isRunning}
          isSystemState={isSystemState}
          showStartHint={showStartHint}
          aiStatus={aiStatus}
          aiConfidence={aiConfidence}
          videoRef={videoRef}
          canvasRef={canvasRef}
          countdownSeconds={countdownSeconds}
          formatCountdown={formatCountdown}
        />
      </div>
      <MotivationFooter text={motivationText} />
    </div>
  );
}

export default TimerWorkspace;
