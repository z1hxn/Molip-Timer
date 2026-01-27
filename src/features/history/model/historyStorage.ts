export const HISTORY_KEY = 'molipHistory';

export type HistoryEntry = {
  id: string;
  nickname: string;
  totalTime: number;
  focusTime: number;
  startedAt: string;
  endedAt: string;
};

type NewHistoryEntry = Omit<HistoryEntry, 'id'>;

const createId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const parseHistory = (raw: string | null): HistoryEntry[] => {
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(Boolean) as HistoryEntry[];
    }
    return [];
  } catch (error) {
    console.error('Failed to parse history from localStorage:', error);
    return [];
  }
};

export const getHistoryEntries = () => {
  return parseHistory(localStorage.getItem(HISTORY_KEY));
};

const writeHistoryEntries = (entries: HistoryEntry[]) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
};

export const addHistoryEntry = (entry: NewHistoryEntry) => {
  const current = getHistoryEntries();
  const nextEntry: HistoryEntry = {
    ...entry,
    id: createId(),
  };
  const next = [nextEntry, ...current].sort(
    (a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime()
  );
  writeHistoryEntries(next);
  return nextEntry;
};

export const formatDuration = (seconds: number) => {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

