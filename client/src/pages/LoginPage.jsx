// LoginForm: form for logging in with email and password.
// Performs client-side validation before sending the request.

import { useState } from "react";
import { useNavigate } from "react-router";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext.jsx";

function LoginForm() {
  // Controlled form state — each input is bound to a state variable.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // errorMessage: displayed to the user when login or validation fails.
  const [errorMessage, setErrorMessage] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate(); // for redirecting after successful login

  // Form submit handler.
  const handleSubmit = async (event) => {
    event.preventDefault(); // prevent the browser's default form submission (page reload)
    setErrorMessage(""); // clear previous error

    // Client-side validation (exam requirement: "Essential data validation in React").
    if (!email || !password) {
      setErrorMessage("Email and password are required.");
      return;
    }
    // Basic email format check.
    if (!email.includes("@") || !email.includes(".")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    // Call the login function from AuthContext.
    try {
      await login({ email, password });
      navigate("/"); // redirect to home page after successful login
    } catch (err) {
      // Server returned an error (e.g., "Incorrect email or password.").
      setErrorMessage(err.message);
    }
  };


return (
    <Container className="mt-4">
      <Row className="justify-content-md-center">
        <Col md={5}>
          <h2 className="mb-3">Login</h2>

          {/* Show error message if present */}
          {errorMessage && (
            <Alert
              variant="danger"
              dismissible
              onClose={() => setErrorMessage("")}
            >
              {errorMessage}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                placeholder="example@test.com"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button type="submit" variant="brand"
>
              Log In
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
export default LoginForm;