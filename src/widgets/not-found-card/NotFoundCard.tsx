import { useNavigate } from 'react-router-dom';

function NotFoundCard() {
  const navigate = useNavigate();

  return (
    <div className="page-center">
      <div className="card timer-card">
        <h1 className="error-code">404</h1>
        <h4 className="error-title">Page Not Found</h4>
        <p className="description">지금 방문하신 페이지는 <strong>존재하지 않는</strong> 페이지입니다</p>
        <button className="btn btn-primary btn-large" onClick={() => navigate('/')}>
          홈으로 가기
        </button>
      </div>
    </div>
  );
}

export default NotFoundCard;
