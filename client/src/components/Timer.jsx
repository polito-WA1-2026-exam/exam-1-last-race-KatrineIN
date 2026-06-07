// Timer: counts down `durationMs` from `startedAt` (a Date.now() timestamp).
// Calls onExpire() once when time runs out — used to auto-submit the route.

import { useState, useEffect, useRef } from "react";

function Timer({ startedAt, durationMs, onExpire }) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, durationMs - (Date.now() - startedAt))
  );

  // Keep the latest onExpire in a ref so the interval always calls the current
  // version — otherwise it would close over stale route state from mount time.
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const interval = setInterval(() => {
      const left = Math.max(0, durationMs - (Date.now() - startedAt));
      setRemaining(left);
      if (left <= 0) {
        clearInterval(interval);
        onExpireRef.current(); // call the latest handler -> latest route
      }
    }, 250);

    return () => clearInterval(interval); // cleanup on unmount or dep change
  }, [startedAt, durationMs]);

  const seconds = Math.ceil(remaining / 1000);

  return (
    <div style={{ fontSize: "1.5rem", fontWeight: "bold", textAlign: "center" }}>
      ⏱ {seconds}s
    </div>
  );
}

export default Timer;