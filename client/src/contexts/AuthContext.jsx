// AuthContext: provides the currently logged-in user to all components.
// Avoids "prop drilling" by making the user available via the useAuth() hook.

import { createContext, useContext, useState, useEffect } from "react";
import API from "../API.js";

// Create the context
const AuthContext = createContext(null);

// Provider component. Wrap the app in this so all children can use useAuth().
export function AuthProvider({ children }) {
  // user: the logged-in user object, or null if not logged in.
  const [user, setUser] = useState(null);
  // loading: true during the initial check for an existing session.
  const [loading, setLoading] = useState(true);

  // On mount, check if there's an existing session on the server.
  // This restores login state after a page refresh.
  useEffect(() => {
    API.getUserInfo()
      .then((u) => setUser(u)) // if loged in, set user
      .catch(() => setUser(null)) // not logged in, set user = null
      .finally(() => setLoading(false));
  }, []);

  // Log in: call the API, store the returned user.
  // Throws on failure so the caller (LoginForm) can show an error.
  const login = async (credentials) => {
    const u = await API.logIn(credentials);
    setUser(u);
  };

  // Log out: call the API, clear local user state.
  const logout = async () => {
    await API.logOut();
    setUser(null);
  };

  // The value object exposed to consumer
  const value = { user, loading, login, logout };

  // gives all children components access to vaule
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for consuming the context. Usage in components:
//   const { user, login, logout } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}