import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAiPose, useAutoStopCountdown, usePauseSettings, useTimer } from '@features/timer';
import { addHistoryEntry } from '@features/history';
import { TimerFooter, TimerLayout, TimerMainSection } from '@widgets';

function TimerPage() {
  const navigate = useNavigate();
  const nickname = localStorage.getItem('nickname') || 'Guest';

  const [showAiAlert, setShowAiAlert] = useState(true);
  const [showStartHint] = useState(true);
  const [focusActive, setFocusActive] = useState(false);
  const { pauseSeconds, motivationText } = usePauseSettings();
  const { focusTime, totalTime, isRunning, toggle, reset, stop, formatTime, sessionStartedAt } = useTimer(focusActive);
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

  const handleReset = () => {
    if (totalTime > 0) {
      const endedAt = new Date();
      const startedAt = sessionStartedAt
        ? new Date(sessionStartedAt)
        : new Date(endedAt.getTime() - totalTime * 1000);
      addHistoryEntry({
        nickname,
        totalTime,
        focusTime,
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
      });
    }
    reset();
  };

  return (
    <TimerLayout>
      <TimerMainSection
        nickname={nickname}
        totalTime={totalTime}
        focusTime={focusTime}
        isRunning={isRunning}
        onToggle={toggle}
        onReset={handleReset}
        onOpenSettings={() => navigate('/settings')}
        formatTime={formatTime}
        isSystemState={isSystemState}
        showAutoStopAlert={showAutoStopAlert}
        onCloseAutoStop={() => setShowAutoStopAlert(false)}
        showAiAlert={showAiAlert}
        onCloseAiAlert={() => setShowAiAlert(false)}
        showStartHint={showStartHint}
        aiStatus={aiStatus}
        aiConfidence={aiConfidence}
        videoRef={videoRef}
        canvasRef={canvasRef}
        countdownSeconds={countdownSeconds}
        formatCountdown={formatCountdown}
      />
      <TimerFooter text={motivationText} />
    </TimerLayout>
  );
}

export default TimerPage;
