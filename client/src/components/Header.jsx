// Header: top navigation bar. Shows app title and login/logout button.
// Displays the logged-in user's name when authenticated.

import { Link, useNavigate } from "react-router";
import { Navbar, Container, Button, Nav } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext.jsx";

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
<Navbar variant="dark" expand="lg" style={{ backgroundColor: "var(--brand)" }}>      <Container>
        {/* App title (clickable, returns to home) */}
        <Navbar.Brand as={Link} to="/" className="fw-normal">
          🚇 Last Race Through Scranton
        </Navbar.Brand>

        {/* Right side: login status */}
        <Nav className="ms-auto align-items-center">
          {user ? (
            <>
              <Navbar.Text className="me-3 text-white">
                Welcome, <strong>{user.name}</strong>
              </Navbar.Text>
              <Button variant="outline-light" className="me-2" onClick={() => navigate("/game")}>
                Play
              </Button>
              <Button variant="outline-light" className="me-2" onClick={() => navigate("/ranking")}>
                Ranking
              </Button>
              <Button variant="outline-light" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button variant="outline-light" onClick={() => navigate("/login")}>
              Login
            </Button>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

export default Header;