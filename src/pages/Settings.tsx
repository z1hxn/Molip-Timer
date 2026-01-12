import { useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';

function applySettings(
  newName: string,
  pauseMinutes: number,
  setName: (v: string) => void
) {
  const finalName = newName.trim() || 'Guest';
  setName(finalName);
  localStorage.setItem('nickname', finalName);
  localStorage.setItem('pauseMinutes', String(pauseMinutes));
  alert('설정이 저장되었습니다.');
}

function Settings() {
  const savedName = localStorage.getItem('nickname') || 'Guest';
  const [name, setName] = useState(savedName);
  const [inputName, setInputName] = useState(savedName);
  const [pauseMinutes, setPauseMinutes] = useState<number>(5);

  return (
    <div className="page-center">
      <div className="card timer-card">
        <h1 className="title">설정</h1>

        <p className="description">
          아래에 귀하의 <strong>닉네임</strong>을 입력해 주세요!
        </p>

        <p className="description">
          현재 닉네임은 <strong>{name}</strong>입니다.
        </p>

        <InputGroup className="mb-3">
          <InputGroup.Text>닉네임</InputGroup.Text>
          <Form.Control
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
          />
        </InputGroup>

        <Form.Group className="mb-3">
          <Form.Label>미집중 시 자동 정지 시간</Form.Label>
          <Form.Select
            value={pauseMinutes}
            onChange={(e) => setPauseMinutes(Number(e.target.value))}
          >
            <option value={3}>3분</option>
            <option value={5}>5분</option>
            <option value={10}>10분</option>
            <option value={15}>15분</option>
          </Form.Select>
        </Form.Group>

        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            applySettings(inputName, pauseMinutes, setName);
          }}
        >
          저장
        </button>
      </div>
    </div>
  );
}

export default Settings;