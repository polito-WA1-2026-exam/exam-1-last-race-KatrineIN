-- Database schema and test users for WA1 Exam: Last Race
-- Run with: node init-db.js


-- Drop all tables to be able to rerun script
DROP TABLE IF EXISTS gameSteps;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS lineStations;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS lines;
DROP TABLE IF EXISTS stations;
DROP TABLE IF EXISTS users;


-- USER TABLE 
-- Sotres authenitcated users, 
-- passwords are encrypted hashes with per user salt
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  hash TEXT NOT NULL, -- scrypt hash of password
  salt TEXT NOT NULL  -- per-user random salt
);


-- METRO NETWORK TABELS

-- METRO STATIONS TABLE
CREATE TABLE stations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);


-- METRO LINES TABLE
CREATE TABLE lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL
);


-- JUNCTION TABLE 
-- maps stations to lines with ordering
-- A station appearing on multiple lines is an interchange station.
-- Position: the order the station has on the line. used to indentify neighbouring stations
CREATE TABLE lineStations (
  lineId INTEGER NOT NULL,
  stationId INTEGER NOT NULL,
  position INTEGER NOT NULL,
  PRIMARY KEY (lineId, stationId),
  UNIQUE (lineId, position), -- makes sure only one statrion pr position
  FOREIGN KEY (stationId) REFERENCES stations(id),
  FOREIGN KEY (lineId) REFERENCES lines(id)
);


-- GAME TABLES

-- EVENT TABLE
-- Predefined events that can happen during travel
-- ex (1, "Kind passenger", 1)
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT NOT NULL,
  effect INTEGER NOT NULL CHECK(effect >= -4 AND effect <= 4)  -- coins won/lost during event, between -4 and +4
);


-- GAME TABLE
CREATE TABLE games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  startStationId INTEGER NOT NULL,
  destinationStationId INTEGER NOT NULL,
  finalScore INTEGER,  -- null until game is complete, stored as 0 if negative og invalid
  status TEXT NOT NULL CHECK (status IN ('planning','completed')), 
  isValid INTEGER,  -- 1 if route was valid, 0 if invalid. NULL during planning.
  createdAt TEXT NOT NULL,  -- ISO 8601 string, e.g. '2026-05-30T10:00:00'
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (startStationId) REFERENCES stations(id),
  FOREIGN KEY (destinationStationId) REFERENCES stations(id)
);


-- GAME SEGMENTS TABLE
-- The route submitted by the player, one row per segment
-- eventId is NULL until execution phase assigns a random event to each segment.
CREATE TABLE gameSteps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gameId INTEGER NOT NULL,
  fromStationId INTEGER NOT NULL,
  toStationId INTEGER NOT NULL,
  stepNumber INTEGER NOT NULL,       -- order in the users route (1, 2, 3...)
  eventId INTEGER,                   -- filled in during execution
  remainingCoins INTEGER,            -- filled in during execution
  UNIQUE (gameId, stepNumber),
  FOREIGN KEY (gameId) REFERENCES games(id),
  FOREIGN KEY (fromStationId) REFERENCES stations(id),
  FOREIGN KEY (toStationId) REFERENCES stations(id),
  FOREIGN KEY (eventId) REFERENCES events(id)
);


-- SEED DATA

-- CREATE TEST USERS
-- Test users, passowrd = "password"
INSERT INTO users (email, name, hash, salt) VALUES
  ('pam@dm.com', 'Pam', 
  'f98f24836745bfbfb5693b0f75e588a65a698268031b03f1430d8d20f868f292', 
  '4cb76b6aaa2dbf28'),
  ('jim@dm.com', 'Jim', 
  '2f90588c20fecda9a9460d9edf0812413d942d7de9c59ccac27be9ce986de140', 
  '9ec4589254904ad1'),
  ('dwight@dm.com', 'Dwight', 
  '55d5a7061bf4d2c176409074250dfefca7dfd9857e687bcd98b1758bde54036d', 
  '6544f5595b9f2496');


-- CREATE STATIONS
INSERT INTO stations (name) VALUES
  ('Scranton Central'),                  
  ('Scranton Business Park'),             
  ('Dunder Mifflin Terminal'),            
  ('Warehouse Depot'),     
  ('Vance Refrigeration'),       
  ('Michael Scott Paper Co.'), 
  ('Cafe Disco'),                   

  ("Poor Richard's Pub"),                 
  ('Dundie Square'),                      
  ('Threat Level Midnight Studios'),      

  ('Hay Place Halt'),                     
  ('Schrute Farms'), 
  ('Assistant Regional Manager Station'), 
  ('Assistant TO the Regional Manager Station'),  

  ('Parkour Park');


-- CREATE LINE
INSERT INTO lines (name, color) VALUES
  ('Green Line', 'green'),
  ('Red Line', 'red'),
  ('Yellow Line', 'yellow'),
  ('Blue Line', 'blue');

  
-- CREATE LINE STATIONS

-- GREEN LINE id(1): 
-- hay place                          -> 11
-- Schrute Farms                      -> 12
-- Scranton Central                   -> 1
-- Scranton Business Park             -> 2
-- Dunder Mifflin Terminal            -> 3
-- Assistant Regional Manager Station -> 13
-- Assistant TO the Regional Station  -> 14
INSERT INTO lineStations (lineId, stationId, position) VALUES  
  (1, 11, 1),
  (1, 12, 2),
  (1, 1, 3),
  (1, 2, 4),
  (1, 3, 5),
  (1, 13, 6),
  (1, 14, 7);


-- RED LINE id(2): 
-- Threat Level Midnight Studios  -> 10
-- Dundie Square                  -> 9
-- Scranton Central               -> 1
-- Poor Richard's Pub             -> 8
INSERT INTO lineStations (lineId, stationId, position) VALUES  
  (2, 10, 1),
  (2, 9, 2),
  (2, 1, 3),
  (2, 8, 4);


-- YELLOW LINE id(3):
-- Michael Scott Paper Co.  -> 6
-- Cafe Disco Plaza         -> 7
-- Parkour Park             -> 15
-- Scranton Business Park   -> 2
-- Scranton Central         -> 1
-- Dundie Square            -> 9

INSERT INTO lineStations (lineId, stationId, position) VALUES
  (3, 6, 1),
  (3, 7, 2),
  (3, 15, 3),
  (3, 2, 4),
  (3, 1, 5),
  (3, 9, 6);


-- BLUE LINE id(4)
-- Vance Refrigeration      -> 5
-- Warehouse Depot          -> 4
-- Dunder Mifflin Terminal  -> 3
-- Scranton Business Park   -> 2
-- Poor Richard's Pub       -> 8
INSERT INTO lineStations (lineId, stationId, position) VALUES
  (4, 5, 1),
  (4, 4, 2),
  (4, 3, 3),
  (4, 2, 4),
  (4, 8, 5);


-- CREATE EVENTS 
INSERT INTO events (description, effect) VALUES
  ('Creed “borrowed” coins from your bag', -4),
  ('Creed somehow became the conductor', -4),
  --('Michael accidentally drove into a lake near the station', -4),
  ('Dwight tested emergency preparedness on your train', -3),
  ('Kelly and Ryan sat down besides you', -3),
  --('Dwight trapped a bat in your train car', -3),
  ('Creed sold you a suspicious train pass', -2),
  ('Mose appeared on the tracks, train delayed', -2),
  --('Dwight accused you of being a security threat', -2),
  --('Kevin spilled chili on the ticket machine', -1),
  ('Andy started singing acapella in your train car', -1),
  ('Angela claimed your seat was reserved for her cat carrier', -1),

  ('Quiet ride through Scranton, no drama', 0),
  ('Mose ran beside the train for several miles', 0),
  --('Jim put Dwight''s stapler in Jell-O again', 0),
  ('Jim gave Dwight a fake assistant TO the conductor badge', 0),
  ('Meredith was somehow already banned from the station', 0),
  ('Michael attempted parkour on the train and knocked over luggage', 0),
  ('Michael declared bankruptcy over the intercom', 0),

  ('Jim dressed as Dwight, causing Dwight to yell “Identity theft is not a joke, Jim!”', 1),  
  --('Oscar corrected your route calculation', 1),
  ('Dwight gave you a complimentary beet', 1),
  ('Michael gave you a World''s Best Passenger mug', 2),
  ('Jim convinced Dwight he needed a train passport', 2),
  --('Stanley shared a Pretzel Day coupon', 2),
  ('Kevin gave you M&Ms', 3),
  ('Pam sketched your portrait during the ride', 3),
  --('Darryl gave you a shortcut through the warehouse', 3),
  ('You won a Dundie for Best Passenger', 4),
  --('Michael declared free upgrades for everyone', 4),
  ('Threat Level Midnight played on the screens', 4);


-- CREATE COMPLETED GAMES
-- gameSteps are not seeded for code simplicity, mainly used to view rank page

INSERT INTO games (userId, startStationId, destinationStationId, finalScore, status, isValid, createdAt) VALUES
  -- Pam (userId 1): 3 games
  (1, 11, 8, 24, 'completed', 1, '2026-05-20T10:30:00'),  
  (1, 5, 14, 18, 'completed', 1, '2026-05-22T14:15:00'),  
  (1, 6, 10, 0, 'completed', 0, '2026-05-25T09:00:00'),    --  invalid route
  -- Jim (userId 2): 2 games
  (2, 10, 4, 27, 'completed', 1, '2026-05-21T16:45:00'),   
  (2, 12, 7, 15, 'completed', 1, '2026-05-24T11:20:00');   