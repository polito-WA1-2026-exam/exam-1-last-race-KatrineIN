// HomePage: public landing page with the game instructions.
// Anonymous users see only the instructions (no map). Logged-in users also get
// a button to start playing.

import { Button } from "react-bootstrap";
import { Link } from "react-router";
import { useAuth } from "../contexts/AuthContext.jsx";

function HomePage() {
  const { user } = useAuth();

  return (
    <div>
      {/* <h2>Last Race</h2>
      <p>
        Plan and execute a route across the underground network before time runs
        out, gaining or losing coins along the way. Reach your destination with
        the highest score!
      </p> */}

      <h5>How to play</h5>
      <ol>
        <li>Study the network map (lines, stations, connections) in the Setup phase.</li>
        <li>You are given a random start and destination, at least 3 segments apart.</li>
        <li>You have 90 seconds to build a route by selecting segments in sequence.</li>
        <li>Each segment can be used only once; the same station may be visited again.</li>
        <li>Each segment of the journey triggers a random event (−4 to +4 coins).</li>
        <li>Every game starts with 20 coins. An invalid or incomplete route scores 0.</li>
      </ol>

      {user ? (
        <Button as={Link} to="/game">Start game</Button>
      ) : (
        <Button as={Link} to="/login">Log in to start playing.</Button>
      )}
    </div>
  );
}

export default HomePage;