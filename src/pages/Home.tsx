import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-wrapper">
      <div className="home-card">
        <h1 className="home-title">Molip Timer</h1>

        <p className="home-desc">
          Molip Timer는 학습 중 <strong>‘몰입 상태’</strong>를 인식하여
          실제로 집중한 시간만을 기록하는 AI 스터디 타이머입니다.
        </p>

        <p className="home-desc">
          단순히 시간을 측정하는 도구가 아니라, 자세와 움직임을 기반으로
          집중 여부를 판단하여 보다 효율적인 학습을 지원합니다.
        </p>

        <p className="home-desc">
          타이머를 시작하고, 몰입하고, 학습 결과를 확인해 보세요.
        </p>

        <Button
          size="lg"
          className="home-btn"
          onClick={() => navigate('/timer')}
        >
          지금 시작하기
        </Button>
      </div>
    </div>
  );
}

export default Home;