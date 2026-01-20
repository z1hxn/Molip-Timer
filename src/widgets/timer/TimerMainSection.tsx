import type { RefObject } from 'react';
import { AiPanel, TimerAlerts, TimerPanel } from '@features/timer';

type TimerMainSectionProps = {
  nickname: string;
  totalTime: number;
  focusTime: number;
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  onOpenSettings: () => void;
  formatTime: (seconds: number) => string;
  isSystemState: boolean;
  showAutoStopAlert: boolean;
  onCloseAutoStop: () => void;
  showAiAlert: boolean;
  onCloseAiAlert: () => void;
  showStartHint: boolean;
  aiStatus: string;
  aiConfidence: number | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  countdownSeconds: number;
  formatCountdown: (seconds: number) => string;
};

function TimerMainSection({
  nickname,
  totalTime,
  focusTime,
  isRunning,
  onToggle,
  onReset,
  onOpenSettings,
  formatTime,
  isSystemState,
  showAutoStopAlert,
  onCloseAutoStop,
  showAiAlert,
  onCloseAiAlert,
  showStartHint,
  aiStatus,
  aiConfidence,
  videoRef,
  canvasRef,
  countdownSeconds,
  formatCountdown,
}: TimerMainSectionProps) {
  return (
    <>
      <TimerAlerts
        isSystemState={isSystemState}
        showAutoStopAlert={showAutoStopAlert}
        onCloseAutoStop={onCloseAutoStop}
        showAiAlert={showAiAlert}
        onCloseAiAlert={onCloseAiAlert}
        aiStatus={aiStatus}
      />

      <div className="timer-layout">
        <TimerPanel
          nickname={nickname}
          totalTime={totalTime}
          focusTime={focusTime}
          isRunning={isRunning}
          onToggle={onToggle}
          onReset={onReset}
          onOpenSettings={onOpenSettings}
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
    </>
  );
}

export default TimerMainSection;
