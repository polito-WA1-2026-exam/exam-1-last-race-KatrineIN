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
  <div className="setup-page text-center">
    <h2 className="setup-title">Network map</h2>

    <p className="text-muted setup-text">
      Study the lines and stations. When you are ready, start the game and begin planning!
    </p>

    <div className="setup-map-wrapper">
      <img
        src={networkFull}
        alt="Full network map with lines and stations"
        className="setup-map"
      />
    </div>

    <Button variant="brand" onClick={handleStartClick} disabled={starting}>
      Start game
    </Button>
  </div>
);
}

export default SetupPhase;