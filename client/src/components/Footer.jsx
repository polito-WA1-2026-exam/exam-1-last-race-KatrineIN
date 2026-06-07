import { Container } from "react-bootstrap";


function Footer() {
  return (
<footer className="mt-auto py-3 text-white" style={{ backgroundColor: "var(--brand)" }}>      <Container className="text-center">
        <small>Last Race Through Scranton — Web Applications I exam project</small>
      </Container>
    </footer>
  );
}

export default Footer;