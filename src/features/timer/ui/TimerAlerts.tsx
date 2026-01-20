import { Alert } from 'react-bootstrap';

type TimerAlertsProps = {
  isSystemState: boolean;
  showAutoStopAlert: boolean;
  onCloseAutoStop: () => void;
  showAiAlert: boolean;
  onCloseAiAlert: () => void;
  aiStatus: string;
};

function TimerAlerts({
  isSystemState,
  showAutoStopAlert,
  onCloseAutoStop,
  showAiAlert,
  onCloseAiAlert,
  aiStatus,
}: TimerAlertsProps) {
  if (!isSystemState && !showAutoStopAlert) return null;

  return (
    <div style={{ width: '100%', maxWidth: '1100px', marginBottom: '20px' }}>
      {showAutoStopAlert && (
        <Alert
          variant="warning"
          dismissible
          onClose={onCloseAutoStop}
          className="text-center fw-bold shadow-sm"
        >
          미집중 상태가 계속되어 타이머가 정지되었습니다.
        </Alert>
      )}
      {isSystemState && showAiAlert && (
        <Alert
          variant={aiStatus === 'AI 모델 로딩 중입니다' ? 'info' : 'danger'}
          dismissible
          onClose={onCloseAiAlert}
          className="text-center fw-bold shadow-sm"
        >
          {aiStatus}
        </Alert>
      )}
    </div>
  );
}

export default TimerAlerts;
