// Main server entry point.
// Sets up Express, CORS, sessions, Passport authentication, and routes.

// imports
import express from "express";
import morgan from "morgan";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import LocalStrategy from "passport-local";

import { getUserByCredentials } from "./dao-users.js";


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


/* ROUTES */

/* Auth routes */
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

// TODO : Add exam-specific routes below ===
// Use isLoggedIn middleware on routes that require auth, e.g.:
// app.get("/api/items", isLoggedIn, (req, res) => { ... });


/* Start server */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/`);
});
