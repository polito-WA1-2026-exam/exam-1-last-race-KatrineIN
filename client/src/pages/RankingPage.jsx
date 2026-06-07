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
    return (
      <div className="text-center mt-4">
        <Spinner animation="border" /> Loading...
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="ranking-page">
      <div className="d-flex align-items-center gap-3 mb-3">
        <div className="ranking-icon">🏆</div>
        <div>
          <h2 className="mb-0">Ranking</h2>
          <p className="text-muted mb-0">Best score per player</p>
        </div>
      </div>

      <Table bordered hover className="ranking-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>Best score</th>
          </tr>
        </thead>

        <tbody>
          {ranking.map((row, index) => (
            <tr
              key={row.userId}
              className={
                user && row.userId === user.id ? "table-brand-light" : ""
              }
            >
              <td>
                <span className="rank-number">
                  {index === 0
                    ? "🥇"
                    : index === 1
                    ? "🥈"
                    : index === 2
                    ? "🥉"
                    : index + 1}
                </span>
              </td>

              <td>
                {row.name}
                {user && row.userId === user.id && (
                  <span className="ms-2 text-muted small">(you)</span>
                )}
              </td>

              <td>
                {row.bestScore}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default RankingPage;