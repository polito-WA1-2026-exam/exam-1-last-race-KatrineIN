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
      //navigate("/login"); // redirect to login page after logout
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <Navbar bg="light" variant="light" expand="lg">
      <Container>
        {/* App title (clickable, returns to home) */}
        <Navbar.Brand as={Link} to="/">
          WA1 Exam Project
        </Navbar.Brand>

        {/* Right side: login status */}
        <Nav className="ms-auto align-items-center">
          {user ? (
            <>
              <Navbar.Text className="me-3">
                Welcome, <strong>{user.name}</strong>
              </Navbar.Text>
              <Button variant="outline-dark" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <Button
              variant="outline-dark"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

export default Header;