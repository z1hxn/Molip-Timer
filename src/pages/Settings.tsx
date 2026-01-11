import { useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';

function Settings() {
  const [name, setName] = useState('Guest');
  const [inputName, setInputName] = useState('');

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

        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            setName(inputName);
            localStorage.setItem('nickname', inputName);
            alert(`닉네임이 변경되었습니다, ${inputName}님!`);
          }}
        >
          저장
        </button>
      </div>
    </div>
  );
}

export default Settings;