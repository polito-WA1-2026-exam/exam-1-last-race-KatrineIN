// HomePage: landing page with game instructions.
// Logged-in users can start the game, anonymous users are sent to login.

import { Button, Card } from "react-bootstrap";
import { Link } from "react-router";
import { useAuth } from "../contexts/AuthContext.jsx";

const STEPS = [
  {
    icon: "🗺️",
    text: "Study the network map — lines, stations, and connections — during the Setup phase.",
  },
  {
    icon: "📍",
    text: "You get a random start and destination. The destination is at least 3 segments away.",
  },
  {
    icon: "⏱️",
    text: "You have 90 seconds to build a route by selecting connected segments in order.",
  },
  {
    icon: "🔁",
    text: "Each segment can be used only once, but the same station may be visited more than once.",
  },
  {
    icon: "🎲",
    text: "Each travelled segment triggers a random event worth −4 to +4 coins.",
  },
  {
    icon: "🪙",
    text: "You start with 20 coins. Invalid or incomplete routes score 0.",
  },
];

function HomePage() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <section className="text-center mb-4">
        <div style={{ fontSize: "3rem" }}>🚇</div>

        <h1 className="fw-bold mb-2">Last Race Through Scranton</h1>

        <p className="text-muted mb-4">
          Plan a metro route before time runs out. Reach the destination with
          as many coins as possible.
        </p>

        <Button
          size="lg"
          variant="brand"
          as={Link}
          to={user ? "/game" : "/login"}
          className="px-5 fw-semibold rounded-pill"
        >
          {user ? "\u25B6\uFE0E Start game" : "Log in to play"}
        </Button>
      </section>

      <Card className="mx-auto shadow-sm" style={{ maxWidth: "720px" }}>
        <Card.Body>
          <h4 className="mb-3">Rules</h4>

          <div className="d-flex flex-column gap-3">
            {STEPS.map((step, index) => (
              <div key={index} className="d-flex align-items-start gap-3">
                <span style={{ fontSize: "1.5rem", lineHeight: "1" }}>
                  {step.icon}
                </span>
                <span>{step.text}</span>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default HomePage;