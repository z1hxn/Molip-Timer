import { useNavigate } from 'react-router-dom';

function HomeWidget() {
  const navigate = useNavigate();

  return (
    <div className="page-center">
      <div className="card home-card">
        <img src="logo.png" className="home-logo" alt="Molip Timer" />
        <h5>공부가 이어지는 리듬</h5>
        <h1 className="title">몰입 타이머</h1>

        <p className="description">
          몰입 타이머는 학습 중 <strong>‘몰입 상태’</strong>를 인식하여 실제로 집중한 시간만을 기록하는
          AI 스터디 타이머입니다.
        </p>

        <p className="description">
          단순히 시간을 측정하는 도구가 아니라, 자세와 움직임을 기반으로 집중 여부를 판단하여 보다
          효율적인 학습을 지원합니다.
        </p>

        <p className="description">타이머를 시작하고, 몰입하고, 학습 결과를 확인해 보세요.</p>

        <button className="btn btn-primary btn-lg" onClick={() => navigate('/timer')}>
          지금 몰입하러 가기
        </button>
      </div>
    </div>
  );
}

export default HomeWidget;
