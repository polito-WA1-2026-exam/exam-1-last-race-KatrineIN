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

//  TODO EXAM: Add exam-specific API functions below 
// Example:
// async function getItems() {
//   const response = await fetch(SERVER_URL + "/api/items", { credentials: "include" });
//   return handleResponse(response);
// }

// Export all API functions as a single object for convenient import.
const API = { logIn, getUserInfo, logOut };
export default API;