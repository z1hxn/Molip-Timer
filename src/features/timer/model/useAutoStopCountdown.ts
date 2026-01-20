import { useEffect, useRef, useState } from 'react';

type AutoStopArgs = {
  isRunning: boolean;
  aiStatus: string;
  pauseSeconds: number;
  onAutoStop: () => void;
};

export function useAutoStopCountdown({ isRunning, aiStatus, pauseSeconds, onAutoStop }: AutoStopArgs) {
  const [countdownSeconds, setCountdownSeconds] = useState(pauseSeconds);
  const [showAutoStopAlert, setShowAutoStopAlert] = useState(false);
  const countdownRef = useRef<number | null>(null);

  useEffect(() => {
    setCountdownSeconds(pauseSeconds);
  }, [pauseSeconds]);

  useEffect(() => {
    if (!isRunning || aiStatus !== '미집중') {
      if (countdownRef.current !== null) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      setCountdownSeconds(pauseSeconds);
      return;
    }

    if (countdownRef.current !== null) {
      clearInterval(countdownRef.current);
    }

    countdownRef.current = window.setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          if (countdownRef.current !== null) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          setShowAutoStopAlert(true);
          onAutoStop();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current !== null) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [aiStatus, isRunning, pauseSeconds, onAutoStop]);

  return {
    countdownSeconds,
    showAutoStopAlert,
    setShowAutoStopAlert,
  };
}
