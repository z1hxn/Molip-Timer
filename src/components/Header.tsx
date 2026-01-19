import { Container, Nav, Navbar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();

  return (
    <Navbar expand="lg" className="mb-4 shadow-sm bg-white py-3">
      <Container>
        <Navbar.Brand onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img
            alt="Molip Timer"
            src="/text-kr.png"
            height="32"
            className="d-inline-block align-top"
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link className="mx-2 fw-medium" onClick={() => navigate('/')}>홈</Nav.Link>
            <Nav.Link className="mx-2 fw-medium" onClick={() => navigate('/timer')}>타이머</Nav.Link>
            <Nav.Link className="mx-2 fw-medium" onClick={() => navigate('/history')}>기록</Nav.Link>
            <Nav.Link className="mx-2 fw-medium" onClick={() => navigate('/settings')}>설정</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Header;