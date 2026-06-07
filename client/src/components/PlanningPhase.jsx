// PlanningPhase: 90 seconds to build a route from start to destination by
// selecting segments in sequence. Shows the stations-only image, the segment
// list, and a countdown that auto-submits on expiry.

import { useState, useEffect, useRef } from "react";
import { Alert, Button, Card, Row, Col, ListGroup, Spinner, Badge } from "react-bootstrap";
import API from "../API.js";
import Timer from "./Timer.jsx";
import networkStations from "../assets/network-stations.png";

const PLANNING_MS = 90000; // 90 seconds

// Canonical key for an undirected segment {a,b} (smaller id first).
const segmentKey = (a, b) => (a < b ? `${a}-${b}` : `${b}-${a}`);

function PlanningPhase({ gameId, start, destination, onSubmitted }) {
  const [stations, setStations] = useState([]);
  const [segments, setSegments] = useState([]);
  const [route, setRoute] = useState([]); // [{ fromStationId, toStationId }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [startedAt] = useState(() => Date.now()); // 90s window starts on mount
  const submittedRef = useRef(false);             // guard: never submit twice

  useEffect(() => {
    const load = async () => {
      try {
        const [st, sg] = await Promise.all([API.getStations(), API.getSegments()]);
        setStations(st);
        setSegments(sg);
      } catch {
        setError("Could not load planning data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Defensive: don't render until the assignment props are present.
  if (!start || !destination) {
    return <div className="text-center mt-4"><Spinner animation="border" /></div>;
  }

  // Where the route currently ends (the start station if nothing selected yet).
  const currentStation = route.length ? route[route.length - 1].toStationId : start.id;
  const usedKeys = new Set(route.map((s) => segmentKey(s.fromStationId, s.toStationId)));
  const nameOf = (id) => stations.find((s) => s.id === id)?.name ?? `#${id}`;

  const selectSegment = (seg) => {
    if (seg.aId === currentStation) {
      setRoute([...route, { fromStationId: seg.aId, toStationId: seg.bId }]);
    } else if (seg.bId === currentStation) {
      setRoute([...route, { fromStationId: seg.bId, toStationId: seg.aId }]);
    }
  };

  const undoLast = () => setRoute(route.slice(0, -1));
  const resetRoute = () => setRoute([]);

  // Submit the current route — called by the button AND on timeout.
  const submit = async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    try {
      const result = await API.submitRoute(gameId, route);
      onSubmitted(result);
    } catch {
      submittedRef.current = false;
      setError("Could not submit your route. Please try again.");
    }
  };

  if (loading) {
    return <div className="text-center mt-4"><Spinner animation="border" /> Loading...</div>;
  }
  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  const atDestination = currentStation === destination.id;

  return (
  <div>
    {/* Title + timer */}
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h2 className="mb-0">Planning</h2>
      <Timer startedAt={startedAt} durationMs={PLANNING_MS} onExpire={submit} />
    </div>

    {/* Map first */}
    <Card className="mb-3 shadow-sm">
      <Card.Body className="text-center py-2">
        <img
          src={networkStations}
          alt="Stations only, without lines"
          style={{ maxWidth: "100%", maxHeight: "34vh" }}
        />
      </Card.Body>
    </Card>

    {/* Mission box */}
    <Card className="mb-3 shadow-sm">
      <Card.Body className="py-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <div className="text-muted small">Start</div>
            <h5 className="mb-0">{start.name}</h5>
          </div>

          <div className="fs-3 text-muted">→</div>

          <div>
            <div className="text-muted small">Destination</div>
            <h5 className="mb-0">{destination.name}</h5>
          </div>

          <div className="ms-auto">
            <Badge bg={atDestination ? "success" : "secondary"} className="fs-6">
              Currently at: {nameOf(currentStation)}
            </Badge>
          </div>
        </div>
      </Card.Body>
    </Card>

    <Row className="g-3">
      {/* Segment list */}
      <Col md={7}>
        <Card className="shadow-sm h-100">
          <Card.Body>
            <h5>Available segments</h5>

            <p className="text-muted small mb-3">
              Pick a segment connected to <strong>{nameOf(currentStation)}</strong>.
            </p>

            <ListGroup style={{ maxHeight: 330, overflowY: "auto" }}>
              {segments.map((seg) => {
                const key = segmentKey(seg.aId, seg.bId);
                const used = usedKeys.has(key);
                const connects =
                  seg.aId === currentStation || seg.bId === currentStation;

                return (
                  <ListGroup.Item
                    key={key}
                    action
                    disabled={used || !connects}
                    onClick={() => selectSegment(seg)}
                    className={connects && !used ? "segment-available" : ""}
                  >
                    {seg.aName} — {seg.bName}

                    {used && (
                      <Badge bg="secondary" className="ms-2">
                        used
                      </Badge>
                    )}
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          </Card.Body>
        </Card>
      </Col>

      {/* Route builder */}
      <Col md={5}>
        <Card className="shadow-sm h-100">
          <Card.Body>
            <h5>Your route</h5>

            {route.length === 0 ? (
              <p className="text-muted">
                No segments selected yet. Start from{" "}
                <strong>{start.name}</strong>.
              </p>
            ) : (
              <div className="route-box mb-3">
                <strong>{nameOf(start.id)}</strong>
                {route.map((s, i) => (
                  <span key={i}> → {nameOf(s.toStationId)}</span>
                ))}
              </div>
            )}

            {atDestination && route.length > 0 && (
              <Alert variant="success" className="py-2">
                Destination reached. You can submit the route.
              </Alert>
            )}

            <p className="mb-2">
              Current station: <strong>{nameOf(currentStation)}</strong>
            </p>

            <div className="d-flex gap-2 mb-3">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={undoLast}
                disabled={route.length === 0}
              >
                Undo
              </Button>

              <Button
                variant="outline-secondary"
                size="sm"
                onClick={resetRoute}
                disabled={route.length === 0}
              >
                Reset
              </Button>
            </div>

            <Button className="btn-brand" onClick={submit}>
              Submit route
            </Button>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </div>
);
}

export default PlanningPhase;