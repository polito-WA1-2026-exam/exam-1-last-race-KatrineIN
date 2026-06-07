import { Container } from "react-bootstrap";


function Footer() {
  return (
<footer className="mt-auto py-3 text-white" style={{ backgroundColor: "var(--brand)" }}>      <Container className="text-center">
        <small>Last Race Through Scranton - &copy; Katrine Iden Nedland 2026</small>
      </Container>
    </footer>
  );
}

export default Footer;