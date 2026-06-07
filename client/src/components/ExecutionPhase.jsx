// ExecutionPhase: replays a valid route step by step, revealing one event at a
// time with the running coin total. Calls onFinished() when the player continues.

import { useState, useEffect } from "react";
import { Button, ListGroup, Badge } from "react-bootstrap";

const STEP_DELAY_MS = 1500;

function ExecutionPhase({ result, onFinished }) {
  const steps = result?.steps ?? [];
  const [visibleCount, setVisibleCount] = useState(0); //how may events showing now

  // Reveal one more step every STEP_DELAY_MS until all are shown.
  useEffect(() => {
    if (visibleCount >= steps.length) return; // done, no more timeouts

    // Schedule the next step to appear after the delay; increment the visible count.
    const timeout = setTimeout(() => setVisibleCount((c) => c + 1), STEP_DELAY_MS); 
    // Cancel the pending timer on re-run/unmount so it never fires too late.
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

      {/* Only render the steps revealed so far (0..visibleCount). */}
      {steps.slice(0, visibleCount).map((step) => (
        
        <ListGroup.Item key={step.stepNumber} className="execution-step">
          <div className="d-flex justify-content-between align-items-start gap-3">
            <div className="flex-grow-1">
              {/* The segment travelled in this step */}
              <div className="fw-bold mb-2">
                {step.fromStationName} → {step.toStationName}
              </div>

              <div className="event-text d-flex align-items-center gap-2">
                {/* Coloured badge: green for gain, red for loss, grey for neutral */}
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
                  {/* Show "+n" for positive effects, otherwise the number as-is */}
                  {step.eventEffect > 0
                    ? `+${step.eventEffect}`
                    : step.eventEffect}
                </Badge>
                {/* The event description for this step */}
                <span>{step.eventDescription}</span>
              </div>
            </div>

            {/* Running coin total after this step */}
            <div className="coins-text text-end">
              <strong>{step.remainingCoins}</strong> 🪙
            </div>
          </div>
        </ListGroup.Item>
      ))}
    </ListGroup>

    {done && (
      <Button onClick={onFinished} variant="brand">
        See result
      </Button>
    )}
  </div>
);
}

export default ExecutionPhase;