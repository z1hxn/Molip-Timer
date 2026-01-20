import { useState } from 'react';
import { Alert, Form, InputGroup } from 'react-bootstrap';

const DEFAULT_MOTIVATION = '지금 이 순간이 가장 소중하다';
const DEFAULT_PAUSE_SECONDS = 30;

const getInitialPauseSeconds = () => {
  const storedSeconds = Number(localStorage.getItem('pauseSeconds'));
  if (!Number.isNaN(storedSeconds) && storedSeconds > 0) {
    return storedSeconds;
  }
  const legacy = Number(localStorage.getItem('pauseMinutes') || 5);
  const mapping: Record<number, number> = {
    3: 15,
    5: 30,
    10: 60,
    15: 120,
  };
  return mapping[legacy] ?? DEFAULT_PAUSE_SECONDS;
};

function SettingsForm() {
  const savedName = localStorage.getItem('nickname') || 'Guest';
  const savedMotivation = localStorage.getItem('motivationText') || DEFAULT_MOTIVATION;
  const [name, setName] = useState(savedName);
  const [inputName, setInputName] = useState(savedName);
  const [pauseSeconds, setPauseSeconds] = useState<number>(getInitialPauseSeconds());
  const [motivationText, setMotivationText] = useState(savedMotivation);
  const [showSavedAlert, setShowSavedAlert] = useState(false);

  const applySettings = () => {
    const finalName = inputName.trim() || 'Guest';
    setName(finalName);
    localStorage.setItem('nickname', finalName);
    localStorage.setItem('pauseSeconds', String(pauseSeconds));
    localStorage.setItem('motivationText', motivationText.trim() || DEFAULT_MOTIVATION);
    setShowSavedAlert(true);
  };

  return (
    <>
      <div className="settings-header">
        <h1 className="title">설정</h1>
        <p className="description">몰입 환경을 내 스타일로 세팅하세요.</p>
      </div>

      {showSavedAlert && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setShowSavedAlert(false)}
          className="text-center fw-bold shadow-sm"
        >
          설정이 저장되었습니다.
        </Alert>
      )}

      <div className="settings-grid">
        <div className="settings-section">
          <h2>프로필</h2>
          <p className="settings-help">타이머에 표시될 닉네임을 정하세요.</p>
          <InputGroup className="mb-3">
            <InputGroup.Text>닉네임</InputGroup.Text>
            <Form.Control value={inputName} onChange={(e) => setInputName(e.target.value)} />
          </InputGroup>
          <div className="settings-preview">
            현재 닉네임: <strong>{name}</strong>
          </div>
        </div>

        <div className="settings-section">
          <h2>타이머</h2>
          <p className="settings-help">미집중 상태가 지속되면 자동으로 타이머를 멈춥니다.</p>
          <Form.Group className="mb-3">
            <Form.Label>미집중 자동 정지 시간</Form.Label>
            <Form.Select value={pauseSeconds} onChange={(e) => setPauseSeconds(Number(e.target.value))}>
              <option value={15}>15초</option>
              <option value={30}>30초</option>
              <option value={60}>1분</option>
              <option value={120}>2분</option>
            </Form.Select>
          </Form.Group>
          <div className="settings-preview">
            현재 설정: <strong>{Math.floor(pauseSeconds / 60)}분 {pauseSeconds % 60}초</strong>
          </div>
        </div>
      </div>

      <div className="settings-section settings-wide">
        <h2>동기부여 문구</h2>
        <p className="settings-help">타이머 화면 하단에 표시됩니다.</p>
        <Form.Control
          as="textarea"
          rows={3}
          value={motivationText}
          onChange={(e) => setMotivationText(e.target.value)}
        />
      </div>

      <div className="settings-actions">
        <button className="btn btn-primary" onClick={applySettings}>
          저장
        </button>
      </div>
    </>
  );
}

export default SettingsForm;
