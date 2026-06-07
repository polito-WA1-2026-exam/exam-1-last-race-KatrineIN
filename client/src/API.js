// API module — wraps all HTTP calls to the Express server.

const SERVER_URL = "http://localhost:3001";

// Generic helper: handle fetch response and return parsed JSON.
// Throws an error if the response is not ok, so callers can use try/catch.
async function handleResponse(response) {
  if (response.ok) {
    const text = await response.text(); //read body as text
    // Some endpoints return empty bodies (e.g. logout). Try to parse JSON, fall back to null.
    return text ? JSON.parse(text) : null;  
  } 
  else {
    // Try to extract an error message from the server response.
    const errorBody = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(errorBody.error || "Request failed");
  }
}

/* Authentication APIs  */

// Log in a user. Returns the user object on success, throws on failure.
async function logIn(credentials) {
  const response = await fetch(SERVER_URL + "/api/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // send and receive the session cookie
    body: JSON.stringify(credentials),
  });
  return handleResponse(response);
}

// Get the currently logged-in user, if any. Returns user object or throws if not authenticated.
async function getUserInfo() {
  const response = await fetch(SERVER_URL + "/api/sessions/current", {
    credentials: "include",
  });
  return handleResponse(response);
}

// Log out the current user.
async function logOut() {
  const response = await fetch(SERVER_URL + "/api/sessions/current", {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse(response);
}

/* ----- NETWORK APIs ----- */

// Get full map with lines, for the Setup phase.
async function getNetworkMap() {
  const response = await fetch(SERVER_URL + "/api/network/map", {
    credentials: "include",
  });
    return handleResponse(response);
};

// Get station names only, for the Planning phase.
async function getStations() {
  const response = await fetch(SERVER_URL + "/api/network/stations", {
    credentials: "include"});
    return handleResponse(response);
};

// List of segments (no line info), for the Planning phase.
async function getSegments() {
  const response = await fetch(SERVER_URL + "/api/network/segments", {
    credentials: "include"
  });
  return handleResponse(response);
};

/* ----- GAME APIs ----- */

// Create a new game. The server assigns start + destination.
async function createGame() {
  const response = await fetch(SERVER_URL + "/api/games", {
    method: "POST",
    credentials: "include",
  });
  return handleResponse(response);
}


// Fetch a single game's state. Includes "steps" only if the game is completed.
async function getGame(gameId) {
  const response = await fetch(SERVER_URL + `/api/games/${gameId}`, {
    credentials: "include",
  });
  return handleResponse(response);
};


// Submit a built route. "route" is an array of { fromStationId, toStationId }.
async function submitRoute(gameId, route) {
  const response = await fetch(SERVER_URL + `/api/games/${gameId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ route }),
  });
  return handleResponse(response);
};


// Best score per user.
async function getRanking() {
  const response = await fetch(SERVER_URL + "/api/ranking", {
    credentials: "include",
  });
  return handleResponse(response);
};



// Export all API functions as a single object for convenient import.
const API = { 
  logIn, 
  getUserInfo, 
  logOut, 
  getNetworkMap, 
  getStations, 
  getSegments,
  createGame, 
  getGame, 
  submitRoute, 
  getRanking 
};
export default API;