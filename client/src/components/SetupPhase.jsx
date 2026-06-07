// SetupPhase: first phase. Shows the full network map (static image) and lets
// the player start the game when ready.

import { useState } from "react";
import { Button } from "react-bootstrap";

import networkFull from "../assets/network-full.png";

function SetupPhase({ onStart }) {
  const [starting, setStarting] = useState(false);

  const handleStartClick = async () => {
    setStarting(true);
    await onStart(); // GamePage handles errors and the phase switch
  };

  return (
    <div>
      <h2>Setup — Network map</h2>
      <p className="text-muted">
        Study the lines and stations. When you are ready, start the game to get
        your route assignment.
      </p>

      <img
        src={networkFull}
        alt="Full network map with all lines and stations"
        style={{ maxWidth: "100%", height: "auto" }}
      />

      <div className="mt-3">
        <Button onClick={handleStartClick} disabled={starting}>
          {starting ? "Starting..." : "Start game"}
        </Button>
      </div>
    </div>
  );
}

export default SetupPhase;