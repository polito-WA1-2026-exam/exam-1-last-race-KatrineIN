import { Container } from "react-bootstrap";
import { Outlet } from "react-router";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

function PageLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <Container className="mt-4 pb-3 flex-grow-1">
        <Outlet />
      </Container>
      <Footer />
    </div>
  );
}

export default PageLayout;