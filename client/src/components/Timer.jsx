// Timer: counts down `durationMs` from `startedAt` (a Date.now() timestamp).
// Calls onExpire() once when time runs out — used to auto-submit the route.

import { useState, useEffect, useRef } from "react";

function Timer({ startedAt, durationMs, onExpire }) {
  // Milliseconds left
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, durationMs - (Date.now() - startedAt))
  );

  // Keep the latest onExpire in a ref so the interval always calls the current
  // version — otherwise it would close over stale route state from mount time.
  const onExpireRef = useRef(onExpire);
  // Sync the ref whenever onExpire changes (without restarting the interval below).
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // timercounts down every 250ms and calls onExpire when it hits zero
  useEffect(() => {
    const interval = setInterval(() => {
      const left = Math.max(0, durationMs - (Date.now() - startedAt));
      setRemaining(left); // update displayed coutdown
      if (left <= 0) {
        clearInterval(interval); // stop ticking once time is up
        onExpireRef.current(); // call the latest handler -> latest route
      }
    }, 250);

    return () => clearInterval(interval); // cleanup on unmount or dep change
  }, [startedAt, durationMs]);

  // converts to sec (rounding up so it shows "0s" only when time is actually up)
  const seconds = Math.ceil(remaining / 1000);

  return (
    <div style={{ fontSize: "1.5rem", fontWeight: "bold", textAlign: "center" }}>
      ⏱ {seconds}s
    </div>
  );
}

export default Timer;