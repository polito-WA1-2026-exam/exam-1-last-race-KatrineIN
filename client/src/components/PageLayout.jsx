// PageLayout: shared layout wrapper. Renders the header and the active route's content.
// Used as a parent route so all pages share the same structure.
import { Container } from "react-bootstrap";
import { Outlet } from "react-router";
import Header from "./Header.jsx";

function PageLayout() {
  return (
    <>
      <Header />
      <Container className="mt-4">
        <Outlet />
      </Container>
    </>
  );
}


export default PageLayout;