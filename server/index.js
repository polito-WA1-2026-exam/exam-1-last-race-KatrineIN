// Main server entry point.
// Sets up Express, CORS, sessions, Passport authentication, and routes.

// imports
import express from "express";
import morgan from "morgan";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import LocalStrategy from "passport-local";
import { body, param, validationResult } from "express-validator";

import { pickStartAndDestination, validateRoute, runExecution } from "./game-logic.js";

import { getUserByCredentials } from "./dao-users.js";
import {
  getNetworkMap,
  getAllStations,
  getAllSegments
} from "./dao-network.js";

import {
  createGame,
  getGameById,
  saveGameSteps,
  completeGame,
  getGameSteps,
  getAllEvents,
  getRanking
} from "./dao-games.js";


// init Express
const app = express();
const PORT = 3001;

// middlewares
app.use(morgan("dev")); // log HTTP requests to console for debugging
app.use(express.json()); // parse JSON request bodies


// CORS - Allow the React dev server (port 5173) to call this API (port 3001).
// credentials:true lets the session cookie travel between client and server.
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));


// Passport authentication setup 

// LocalStrategy looks for username (here email) + password in req.body.
passport.use(new LocalStrategy({ usernameField: "email" }, // tell LocalStrategy to look for "email" instead of "username"
    async (email, password, callback) => {
      try{
        //returns user obj (id, email, name) or null from user-dao
        const user = await getUserByCredentials(email, password); 
        
        if (!user) {
          // return null -> invalid credentials, no error, message
          return callback(null, false, {message: "Incorrect email or password."});
        }
        // success: user (id, email, name) is passed to serializeUser
        return callback(null, user); 

      } catch (err) {
          return callback(err);
      }
    },
  ),
);

// Serialize: store user obj (id, email, name) from LocalStrategy in the session cookie.
// run once during login
passport.serializeUser((user, callback) => {
  callback(null, user);
});

// Deserialize: extract current logged-in user (id, email, name)
// from the data in the session
passport.deserializeUser((user, callback) => { 
    return callback(null, user); // available in req.user
});


/* Sessions */
// Must come before passport.authenticate('session') so the session exists first.
// read session cookie
app.use(
  session({
    secret: "change-this-secret-for-exam",
    resave: false,
    saveUninitialized: false,
  }),
);

// Activate Passport middleware. Restore logged-in user from session cookie
app.use(passport.authenticate("session"));  


// Auth middleware
// Use this on any route that requires the user to be logged in.
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Not authenticated" });
};


// Validation middleware: stop the request with 422 if any validator failed.
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  return next();
};



// ----------------------------- AUTH ROUTES ---------------------------

// POST /api/sessions — log in
app.post("/api/sessions", (req, res, next) => {
  // passport.authenticate("local") uses the LocalStrategy defined above.
  // It checks the email and password from req.body.
  passport.authenticate("local", (err, user, info) => {
    // server/db error during auth
    if (err) {
      return next(err);
    }
    // worng email or password (user=false)
    if (!user) {
      return res.status(401).json({ error: info.message });
    }
    // credentials are correct
    //req.login creates the session and stores the user in it
    req.login(user, (err) => {
      if (err) {
        return next(err); //error while creating login session
      }
      // login successful, return user
      return res.json(req.user);
    });
  })(req, res, next);
});

// GET /api/sessions/current — check if logged in (returns user info)
app.get("/api/sessions/current", (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

// DELETE /api/sessions/current — log out
app.delete("/api/sessions/current", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.status(200).end();
  });
});



// ----------------------------- NETWORK ROUTES ---------------------------

// GET /api/network/map - full map with lines, for the Setup phase.
app.get("/api/network/map", isLoggedIn, async (req, res) => { 
  try {
    const network = await getNetworkMap();
    res.json(network);
  } catch (err) {
        res.status(500).json({ error: "Database error while fetching network map." });
  }
 });


// GET /api/network/stations — station names only, for the Planning phase.
app.get("/api/network/stations", isLoggedIn, async (req, res) => {
  try {
    const stations = await getAllStations();
    res.json(stations);
  } catch (err) {
    res.status(500).json({ error: "Database error while fetching stations." });
  }
});


// GET /api/network/segments — list of segments, no line info, for Planning.
app.get("/api/network/segments", isLoggedIn, async (req, res) => {
  try{
    const segments = await getAllSegments();
    res.json(segments);
  } catch (err) {
     res.status(500).json({ error: "Database error while fetching segments." });   
  }
});


// ----------------------------- GAME ROUTES ---------------------------

// POST /api/games — create a new game; the server assigns start + destination.
app.post("/api/games", isLoggedIn, async (req, res) => {
  try{
    const userId = req.user.id;

    const allStations = await getAllStations();
    const allSegments = await getAllSegments();
    const { start, destination } = pickStartAndDestination(allStations, allSegments, 3);

    const gameId = await createGame(userId, start.id, destination.id);
    res.status(201).json({ gameId, start, destination });

  } catch (err) {
      res.status(500).json({ error: "Database error while creating new game." });   
  }
});


// GET /api/games/:id — fetch game state; includes steps only if completed.
app.get("/api/games/:id", isLoggedIn, param("id").isInt(), checkValidation, async (req, res) => {
    try{
      const userId = req.user.id;
      const gameId = Number(req.params.id);

      const game = await getGameById(gameId, userId);
      if (!game) {
        return res.status(404).json({ error: "Game not found." });
      }
      if (game.status === 'completed') {
        const steps = await getGameSteps(gameId); 
        return res.json({ ...game, steps });
      } 
      res.json(game);
    } catch (err) {
       res.status(500).json({ error: "Database error while fetching game." });   
    }
});


// POST /api/games/:id/submit — validate the route, run the execution
// server-side, and complete the game in one request.
app.post("/api/games/:id/submit", 
  isLoggedIn, 
  param("id").isInt(), 
  body("route").isArray(), // empty array is allowed -> treated as invalid route
  body("route.*.fromStationId").isInt(),
  body("route.*.toStationId").isInt(),
  checkValidation, 
  async (req, res) => {
    try{
      const userId = req.user.id;
      const gameId = Number(req.params.id);
      const route = req.body.route;

      // 1. fetch game
      const game = await getGameById(gameId, userId);
      if (!game) {
        return res.status(404).json({ error: "Game not found." });
      }

      // 2. a game can only be submitted while still in planning
      if (game.status !== "planning") {
        return res.status(409).json({ error: "Game already completed." });
      }

      // 3. validate the submitted route against the network rules
      const segments = await getAllSegments();
      const isValid = validateRoute(route, segments, game.startStationId, game.destinationStationId);
      
      // 4. invalid or incomplete route -> player loses everything, score 0
      if (!isValid) {
        await completeGame(gameId, 0, false);
        return res.json({ isValid: false, finalScore: 0 });
      }

      // 5. valid route -> run execution: one random event per step
      const events = await getAllEvents();
      const steps = runExecution(route, events, 20);
      
      // 6. persist steps + final score (a negative final score is stored as 0)
      // route is non-empty when valid, so the last step always exists
      const finalScore = Math.max(0, steps[steps.length - 1].remainingCoins);
      await saveGameSteps(gameId, steps);
      await completeGame(gameId, finalScore, true);

      // 7. return enriched steps (with station + event names) for the animation
      const enrichedSteps = await getGameSteps(gameId);
      res.json({ isValid: true, finalScore, steps: enrichedSteps });
    } catch (err) {
      res.status(500).json({ error: "Database error while submitting route." });
    }
});


/* Ranking route */

// GET /api/ranking — best score per user. Logged-in only.
app.get("/api/ranking", isLoggedIn, async (req, res) => {
  try {
    const rankings = await getRanking();
    res.json(rankings)
  } catch (err) {
      res.status(500).json({ error: "Database error while fetching ranking." });   
  }
});



/* Start server */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/`);
});
