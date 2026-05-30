// Database connection module.
// Opens the SQLite database file and exports the connection.

import sqlite3 from "sqlite3";

const db = new sqlite3.Database("database.sqlite", (err) => {
  if (err) throw err;
});

export default db;