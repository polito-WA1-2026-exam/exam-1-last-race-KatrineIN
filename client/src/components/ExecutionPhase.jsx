// ExecutionPhase: replays a valid route step by step, revealing one event at a
// time with the running coin total. Calls onFinished() when the player continues.

import { useState, useEffect } from "react";
import { Button, ListGroup, Badge } from "react-bootstrap";

const STEP_DELAY_MS = 1500;

function ExecutionPhase({ result, onFinished }) {
  const steps = result?.steps ?? [];
  const [visibleCount, setVisibleCount] = useState(0);

  // Reveal one more step every STEP_DELAY_MS until all are shown.
  useEffect(() => {
    if (visibleCount >= steps.length) return;
    const timeout = setTimeout(() => setVisibleCount((c) => c + 1), STEP_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [visibleCount, steps.length]);

  const done = visibleCount >= steps.length;

  return (
    <div>
      <h2>Execution</h2>
      <p className="text-muted">Your journey unfolds one segment at a time…</p>

      <ListGroup className="mb-3">
        {steps.slice(0, visibleCount).map((step) => (
          <ListGroup.Item key={step.stepNumber}>
            <div><strong>{step.fromStationName} → {step.toStationName}</strong></div>
            <div>
              {step.eventDescription}{" "}
              <Badge bg={step.eventEffect >= 0 ? "success" : "danger"}>
                {step.eventEffect >= 0 ? `+${step.eventEffect}` : step.eventEffect}
              </Badge>
            </div>
            <div>Coins: <strong>{step.remainingCoins}</strong></div>
          </ListGroup.Item>
        ))}
      </ListGroup>

      {done && <Button onClick={onFinished}>See result</Button>}
    </div>
  );
}

export default ExecutionPhase;