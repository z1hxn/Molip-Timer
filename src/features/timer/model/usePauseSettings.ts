import { useEffect, useState } from 'react';

const DEFAULT_MOTIVATION = '지금 이 순간이 가장 소중하다';

const getPauseSeconds = () => {
  const storedSeconds = Number(localStorage.getItem('pauseSeconds'));
  if (!Number.isNaN(storedSeconds) && storedSeconds > 0) {
    return storedSeconds;
  }
  const raw = Number(localStorage.getItem('pauseMinutes') || 5);
  const mapping: Record<number, number> = {
    3: 15,
    5: 30,
    10: 60,
    15: 120,
  };
  return mapping[raw] ?? raw;
};

export function usePauseSettings() {
  const [pauseSeconds, setPauseSeconds] = useState(getPauseSeconds);
  const [motivationText, setMotivationText] = useState(
    localStorage.getItem('motivationText') || DEFAULT_MOTIVATION
  );

  useEffect(() => {
    const updateSettings = () => {
      setPauseSeconds(getPauseSeconds());
      setMotivationText(localStorage.getItem('motivationText') || DEFAULT_MOTIVATION);
    };
    updateSettings();
    window.addEventListener('focus', updateSettings);
    window.addEventListener('storage', updateSettings);
    return () => {
      window.removeEventListener('focus', updateSettings);
      window.removeEventListener('storage', updateSettings);
    };
  }, []);

  return { pauseSeconds, motivationText };
}
