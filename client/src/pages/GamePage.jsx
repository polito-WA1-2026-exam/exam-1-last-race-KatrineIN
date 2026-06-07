// GamePage: orchestrates a single game through its four phases.
// Acts as a pure state machine — each phase component fetches its own data
// and reports back through callbacks. GamePage only holds the shared state:
// which game, where it starts/ends, and the final result.

import { useState } from "react";
import { Alert, Button } from "react-bootstrap";

import API from "../API.js";
import SetupPhase from "../components/SetupPhase.jsx";
import PlanningPhase from "../components/PlanningPhase.jsx";
import ExecutionPhase from "../components/ExecutionPhase.jsx";
import ResultPhase from "../components/ResultPhase.jsx";

function GamePage() {
  const [phase, setPhase] = useState("setup"); // 'setup' | 'planning' | 'execution' | 'result'
  const [gameId, setGameId] = useState(null);
  const [start, setStart] = useState(null);
  const [destination, setDestination] = useState(null);
  const [result, setResult] = useState(null); // { isValid, finalScore, steps }
  const [error, setError] = useState(null);

  // setup -> planning: create a game; the server assigns start + destination.
  const handleStart = async () => {
    try {
      setError(null);
      const game = await API.createGame();
      setGameId(game.gameId);
      setStart(game.start);
      setDestination(game.destination);
      setPhase("planning");
    } catch {
      setError("Could not start a new game. Please try again.");
    }
  };

  // planning -> execution, or straight to result if the route was invalid.
  const handleSubmitted = (gameResult) => {
    setResult(gameResult);
    setPhase(gameResult.isValid ? "execution" : "result");
  };

  // execution -> result: the step-by-step animation has finished.
  const handleFinished = () => {
    setPhase("result");
  };

  // result -> setup: reset everything for a fresh game.
  const handlePlayAgain = () => {
    setGameId(null);
    setStart(null);
    setDestination(null);
    setResult(null);
    setError(null);
    setPhase("setup");
  };

  if (error) {
    return (
      <Alert variant="danger">
        {error}
        <div className="mt-2">
          <Button variant="outline-danger" size="sm" onClick={handlePlayAgain}>
            Back to start
          </Button>
        </div>
      </Alert>
    );
  }

  // Render the component for the current phase.
  switch (phase) {
    case "setup":
      return <SetupPhase onStart={handleStart} />;
    case "planning":
      return (
        <PlanningPhase
          gameId={gameId}
          start={start}
          destination={destination}
          onSubmitted={handleSubmitted}
        />
      );
    case "execution":
      return <ExecutionPhase result={result} onFinished={handleFinished} />;
    case "result":
      return <ResultPhase result={result} onPlayAgain={handlePlayAgain} />;
    default:
      return null;
  }
}

export default GamePage;