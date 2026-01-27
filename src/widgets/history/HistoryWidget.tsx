import { useEffect, useMemo, useState } from 'react';
import { formatDuration, getHistoryEntries, type HistoryEntry } from '@features/history';

function HistoryWidget() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const load = () => setEntries(getHistoryEntries());
    load();
    window.addEventListener('focus', load);
    window.addEventListener('storage', load);
    return () => {
      window.removeEventListener('focus', load);
      window.removeEventListener('storage', load);
    };
  }, []);

  const hasEntries = entries.length > 0;

  const totalFocusTime = useMemo(() => {
    return entries.reduce((sum, entry) => sum + entry.focusTime, 0);
  }, [entries]);

  return (
    <div className="page-center history-page">
      <div className="card history-card">
        <div className="history-header">
          <h1 className="title">공부 기록</h1>
          <p className="description">
            누적 몰입 시간: <strong>{formatDuration(totalFocusTime)}</strong>
          </p>
        </div>

        {!hasEntries && (
          <div className="history-empty">아직 기록이 없어요. 타이머에서 몰입을 시작해보세요.</div>
        )}

        {hasEntries && (
          <ul className="history-list">
            {entries.map(entry => {
              const endedAtText = new Date(entry.endedAt).toLocaleString('ko-KR', {
                dateStyle: 'medium',
                timeStyle: 'short',
              });
              return (
                <li key={entry.id} className="history-item">
                  <div className="history-item-main">
                    <div className="history-item-title">{entry.nickname}</div>
                    <div className="history-item-date">{endedAtText}</div>
                  </div>
                  <div className="history-item-times">
                    <div className="history-time">
                      <span className="history-time-label">몰입</span>
                      <strong>{formatDuration(entry.focusTime)}</strong>
                    </div>
                    <div className="history-time">
                      <span className="history-time-label">전체</span>
                      <strong>{formatDuration(entry.totalTime)}</strong>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default HistoryWidget;
