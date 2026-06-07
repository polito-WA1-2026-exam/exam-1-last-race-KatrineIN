// ResultPhase: shows the final score and lets the player start a new game.

import { Alert, Button } from "react-bootstrap";
import { Link } from "react-router";

function ResultPhase({ result, onPlayAgain }) {
  return (
    <div>
      <h2>Result</h2>

      {result.isValid ? (
        <Alert variant="success">
          You reached the destination! Final score: <strong>{result.finalScore}</strong> coins.
        </Alert>
      ) : (
        <Alert variant="danger">
          Your route was invalid or incomplete — you lost all your coins. Final score: <strong>0</strong>.
        </Alert>
      )}

      <div className="d-flex gap-2">
        <Button onClick={onPlayAgain}>Play again</Button>
        <Button as={Link} to="/ranking" variant="outline-primary">View ranking</Button>
      </div>
    </div>
  );
}

export default ResultPhase;