// PlanningPhase: 90 seconds to build a route from start to destination by
// selecting segments in sequence. Shows the stations-only image, the segment
// list, and a countdown that auto-submits on expiry.

import { useState, useEffect, useRef } from "react";
import { Alert, Button, Card, Row, Col, Spinner, Badge } from "react-bootstrap";
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

  // Shown when the player clicks a segment that cannot extend the route.
  const [routeError, setRouteError] = useState("");

  const [startedAt] = useState(() => Date.now()); // 90s window starts on mount
  const submittedRef = useRef(false); // guard: never submit twice

  useEffect(() => {
    const load = async () => {
      try {
        const [st, sg] = await Promise.all([
          API.getStations(),
          API.getSegments(),
        ]);
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
    return (
      <div className="text-center mt-4">
        <Spinner animation="border" />
      </div>
    );
  }

  // Where the route currently ends: start station if nothing selected yet.
  const currentStation = route.length
    ? route[route.length - 1].toStationId
    : start.id;

  const usedKeys = new Set(
    route.map((s) => segmentKey(s.fromStationId, s.toStationId))
  );

  const nameOf = (id) =>
    stations.find((s) => s.id === id)?.name ?? `#${id}`;

  const selectSegment = (seg) => {
    const key = segmentKey(seg.aId, seg.bId);

    if (usedKeys.has(key)) {
      setRouteError("This segment has already been used.");
      return;
    }

    if (seg.aId === currentStation) {
      setRouteError("");
      setRoute([...route, { fromStationId: seg.aId, toStationId: seg.bId }]);
    } else if (seg.bId === currentStation) {
      setRouteError("");
      setRoute([...route, { fromStationId: seg.bId, toStationId: seg.aId }]);
    } else {
      setRouteError("That segment does not connect to your current station.");
    }
  };

  const undoLast = () => {
    setRouteError("");
    setRoute(route.slice(0, -1));
  };

  const resetRoute = () => {
    setRouteError("");
    setRoute([]);
  };

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
    return (
      <div className="text-center mt-4">
        <Spinner animation="border" /> Loading...
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  const atDestination = currentStation === destination.id;

  return (
    <div className="planning-page">
      {/* Title + timer */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Planning</h2>
        <Timer
          startedAt={startedAt}
          durationMs={PLANNING_MS}
          onExpire={submit}
        />
      </div>

      {/* Mission box */}
      <Card className="mission-card mb-4 shadow-sm">
        <Card.Body>
          <div className="mission-content">
            <div className="mission-station">
              <div className="text-muted small">Start</div>
              <h5>{start.name}</h5>
            </div>

            <div className="mission-arrow">→</div>

            <div className="mission-station">
              <div className="text-muted small">Destination</div>
              <h5>{destination.name}</h5>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Map */}
      <div className="text-center mb-4">
        <img
          src={networkStations}
          alt="Stations only, without lines"
          className="planning-map"
        />
      </div>

      {/* Route so far */}
      <section className="mb-4">
        <h4>Your route so far</h4>

        <Card className="shadow-sm">
          <Card.Body>
            {route.length === 0 ? (
              <span>{start.name}</span>
            ) : (
              <span>
                <strong>{nameOf(start.id)}</strong>
                {route.map((s, i) => (
                  <span key={i}> → {nameOf(s.toStationId)}</span>
                ))}
              </span>
            )}
          </Card.Body>
        </Card>
      </section>

      {/* Choose next segment */}
      <section className="mb-4">
        <h4>Choose next segment</h4>

        <p className="text-muted small">
          Select segments in sequence. Each segment may only be used once.
        </p>

        {routeError && (
          <Alert variant="warning" className="py-2">
            {routeError}
          </Alert>
        )}

        <Row className="g-2">
          {segments.map((seg) => {
            const key = segmentKey(seg.aId, seg.bId);
            const used = usedKeys.has(key);

            return (
              <Col md={6} key={key}>
                <Button
                  className="segment-button"
                  disabled={used}
                  onClick={() => selectSegment(seg)}
                >
                  {seg.aName} ↔ {seg.bName}
                  {used && <span className="ms-2">✓</span>}
                </Button>
              </Col>
            );
          })}
        </Row>
      </section>

      {/* Controls */}
      <div className="d-flex gap-2 mb-4">
        <Button
          variant="outline-secondary"
          onClick={undoLast}
          disabled={route.length === 0}
        >
          Undo last step
        </Button>

        <Button
          variant="outline-secondary"
          onClick={resetRoute}
          disabled={route.length === 0}
        >
          Reset
        </Button>

        <Button className="btn-brand" onClick={submit}>
          Submit route
        </Button>
      </div>
    </div>
  );
}

export default PlanningPhase;