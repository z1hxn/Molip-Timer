import { FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth/model/AuthContext';

const DEMO_ID = 'molip_user';
const DEMO_PASSWORD = 'password123!';

function LoginWidget() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location.state && typeof location.state === 'object' && 'prefill' in location.state) {
      setUserId(DEMO_ID);
      setPassword(DEMO_PASSWORD);
    }
  }, [location.state]);

  const handleLogin = (event?: FormEvent) => {
    event?.preventDefault();
    setError('');

    if (!userId.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    login();
    setIsSubmitting(false);
    navigate('/');
  };

  return (
    <div className="page-center">
      <div className="card login-card">
        <h2 className="login-title">로그인</h2>
        <p className="login-subtitle">Supabase 연동 전이라 지금은 버튼 한 번으로 로그인됩니다.</p>

        <div className="login-state">
          <p className="login-message">아이디/비밀번호를 입력하고 로그인하세요.</p>
          <form className="login-form" onSubmit={handleLogin}>
            <label className="login-label" htmlFor="login-id">아이디</label>
            <input
              id="login-id"
              className="login-input"
              type="text"
              placeholder="아이디 입력"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
            />
            <label className="login-label" htmlFor="login-password">비밀번호</label>
            <input
              id="login-password"
              className="login-input"
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {error ? <span className="login-error">{error}</span> : null}
            <button className="btn btn-primary btn-lg" type="submit" disabled={isSubmitting}>
              {isSubmitting ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginWidget;
