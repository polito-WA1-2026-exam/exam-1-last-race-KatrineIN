// NotFound: 404 page shown when no other route matches.

import { Link } from "react-router";
import { Button } from "react-bootstrap";

function NotFound() {
  return (
    <div className="text-center mt-5">
      <h2>404 — Page not found</h2>
      <p>The page you are looking for does not exist.</p>
      <Button as={Link} to="/" variant="primary">
        Go to home
      </Button>
    </div>
  );
}

export default NotFound;