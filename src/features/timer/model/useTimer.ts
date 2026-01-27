import { useCallback, useEffect, useRef, useState } from 'react';

export function useTimer(focusActive: boolean) {
  const [focusTime, setFocusTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<number | null>(null);
  const sessionStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        if (focusActive) {
          setFocusTime(prev => prev + 1);
        }
        setTotalTime(prev => prev + 1);
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
  }, [isRunning, focusActive]);

  const toggle = useCallback(() => {
    if (!isRunning && totalTime === 0 && sessionStartRef.current === null) {
      sessionStartRef.current = Date.now();
    }
    setIsRunning(prev => !prev);
  }, [isRunning, totalTime]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setFocusTime(0);
    setTotalTime(0);
    sessionStartRef.current = null;
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  const formatTime = (seconds: number) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return {
    focusTime,
    totalTime,
    isRunning,
    toggle,
    reset,
    stop,
    formatTime,
    sessionStartedAt: sessionStartRef.current,
  };
}
