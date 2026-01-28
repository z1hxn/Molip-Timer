import { useEffect, useRef, useState } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth/model/AuthContext';

function Header() {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Navbar expand="lg" className="mb-4 shadow-sm bg-white py-3">
      <Container>
        <Navbar.Brand onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img
            alt="Molip Timer"
            src={`${import.meta.env.BASE_URL}text-kr.png`}
            height="32"
            style={{ transform: 'scale(1.25)', transformOrigin: 'left center' }}
            className="d-inline-block align-top"
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto">
            <Nav.Link className="mx-2 fw-medium" onClick={() => navigate('/')}>홈</Nav.Link>
            <Nav.Link className="mx-2 fw-medium" onClick={() => navigate('/timer')}>타이머</Nav.Link>
            <Nav.Link className="mx-2 fw-medium" onClick={() => navigate('/history')}>기록</Nav.Link>
            <Nav.Link className="mx-2 fw-medium" onClick={() => navigate('/settings')}>설정</Nav.Link>
          </Nav>
          <Nav className="ms-auto">
            {isLoggedIn ? (
              <div className="profile-menu" ref={menuRef}>
                <button
                  className="avatar-button"
                  type="button"
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  aria-label="프로필 메뉴"
                >
                  <span className="avatar-initial">M</span>
                </button>
                {isMenuOpen ? (
                  <div className="avatar-dropdown">
                    <button
                      className="avatar-item"
                      type="button"
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                        navigate('/');
                      }}
                    >
                      로그아웃
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Nav.Link
                className="mx-2 fw-semibold"
                onClick={() => navigate('/login', { state: { prefill: true } })}
              >
                로그인
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Header;
