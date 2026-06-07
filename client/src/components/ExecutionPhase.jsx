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
    <p className="text-muted">
      Your journey unfolds one segment at a time...
    </p>

    <ListGroup className="mb-3 execution-list">
      {steps.slice(0, visibleCount).map((step) => (
        <ListGroup.Item key={step.stepNumber} className="execution-step">
          <div className="d-flex justify-content-between align-items-start gap-3">
            <div className="flex-grow-1">
              <div className="fw-bold mb-2">
                {step.fromStationName} → {step.toStationName}
              </div>

              <div className="event-text d-flex align-items-center gap-2">
                <Badge
                  bg={
                    step.eventEffect > 0
                      ? "success"
                      : step.eventEffect < 0
                      ? "danger"
                      : "secondary"
                  }
                  className="event-badge"
                >
                  {step.eventEffect > 0
                    ? `+${step.eventEffect}`
                    : step.eventEffect}
                </Badge>

                <span>{step.eventDescription}</span>
              </div>
            </div>

            <div className="coins-text text-end">
              <strong>{step.remainingCoins}</strong> 🪙
            </div>
          </div>
        </ListGroup.Item>
      ))}
    </ListGroup>

    {done && (
      <Button onClick={onFinished} className="btn-brand">
        See result
      </Button>
    )}
  </div>
);
}

export default ExecutionPhase;