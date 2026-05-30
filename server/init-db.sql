-- Database schema and test users for Exam in WA1.
-- Run this script to create or recreate db form scratch


-- USER TABLE 
-- Sotres authenitcated users, 
-- passwords are encrypted hashes with per user salt
DROP TABLE IF EXISTS users; -- to be able to run script several times

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  hash TEXT NOT NULL,
  salt TEXT NOT NULL
);


-- CREATE USERS
-- Users for testing, passowrd = "password"
INSERT INTO users (email, name, hash, salt) VALUES
  ('pam@dm.com', 'Pam', 
  'f98f24836745bfbfb5693b0f75e588a65a698268031b03f1430d8d20f868f292', 
  '4cb76b6aaa2dbf28'),
  
  ('jim@dm.com', 'Jim', 
  '2f90588c20fecda9a9460d9edf0812413d942d7de9c59ccac27be9ce986de140', 
  '9ec4589254904ad1')

-- ADD OTHER TABLES 
-- Template
-- CREATE TABLE items (
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   title TEXT NOT NULL,
--   userId INTEGER NOT NULL,
--   FOREIGN KEY (userId) REFERENCES users(id)
-- );

-- INSERT INTO items (title, userId) VALUES ('Example', 1);
