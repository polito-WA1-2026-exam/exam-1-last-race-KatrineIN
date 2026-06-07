// ResultPhase: shows the final score and lets the player start a new game.

import { Alert, Button, Card } from "react-bootstrap";
import { Link } from "react-router";

function ResultPhase({ result, onPlayAgain }) {
  const valid = result.isValid;
  const score = valid ? result.finalScore : 0;

  return (
    <div className="result-page">
      <Card className="result-card shadow-sm">
        <Card.Body className="text-center p-4">
          <div className="result-icon">
            {valid ? "🏁" : "🚧"}
          </div>

          <h2 className="mb-3">
            {valid ? "Destination reached!" : "Route failed"}
          </h2>

          {valid ? (
            <Alert variant="success" className="mb-4">
              You reached the destination and finished the race.
            </Alert>
          ) : (
            <Alert variant="danger" className="mb-4">
              Your route was invalid or incomplete, so you lost all your coins.
            </Alert>
          )}

          <div className="score-box mb-4">
            <div className="text-muted">Final score</div>
            <div className="score-number">
              {score} <span>🪙</span>
            </div>
          </div>

          <div className="d-flex justify-content-center gap-2">
            <Button onClick={onPlayAgain} className="btn-brand">
              Play again
            </Button>

            <Button as={Link} to="/ranking" className="btn-brand-outline">
              View ranking
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default ResultPhase;