// Helper script to (re)create the database from init-db.sql
// Run with: node init-db.js

import sqlite3 from "sqlite3";
import fs from "fs";

const sql = fs.readFileSync("init-db.sql", "utf8");

const db = new sqlite3.Database("database.sqlite", (err) => {
  if (err) throw err;
});

db.exec(sql, (err) => {
  if (err) {
    console.error("Error:", err);
  } else {
    console.log("Database created successfully.");
  }
  db.close();
});
