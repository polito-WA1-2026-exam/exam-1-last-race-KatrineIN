// RankingPage: shows each player's best score. Logged-in users only.

import { useState, useEffect } from "react";
import { Alert, Spinner, Table } from "react-bootstrap";

import API from "../API.js";
import { useAuth } from "../contexts/AuthContext.jsx";

function RankingPage() {
  const { user } = useAuth();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await API.getRanking();
        setRanking(data);
      } catch {
        setError("Could not load the ranking.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="text-center mt-4"><Spinner animation="border" /> Loading...</div>;
  }
  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      <h2>Ranking</h2>
      <p className="text-muted">Best score per player.</p>
      <Table striped bordered hover>
        <thead>
          <tr><th>#</th><th>Player</th><th>Best score</th></tr>
        </thead>
        <tbody>
          {ranking.map((row, index) => (
            <tr key={row.userId} className={user && row.userId === user.id ? "table-primary" : ""}>
              <td>{index + 1}</td>
              <td>{row.name}</td>
              <td>{row.bestScore}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default RankingPage;