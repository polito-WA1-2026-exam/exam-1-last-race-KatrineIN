// App: main application component.
// Wraps the app in AuthProvider so all routes have access to auth state,
// and defines the route structure.

import { Routes, Route, Navigate } from "react-router";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";

import PageLayout from "./components/PageLayout.jsx";
import NotFound from "./components/NotFound.jsx";

import LoginPage from "./pages/LoginPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import GamePage from "./pages/GamePage.jsx";
import RankingPage from "./pages/RankingPage.jsx";

import "./index.css";



// Protected route wrapper: redirects to / if user is not authenticated.
// Use this around routes that require login.
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading...</p>; // wait for initial session check
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PageLayout />}>
            {/* Public route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Home route — open to all*/}
            <Route path="/" element={<HomePage />} />
         
            {/* Game page — logged in users only*/}
            <Route path="/game" element={
              <ProtectedRoute><GamePage /></ProtectedRoute>
              } />
              
            {/* Ranking page — logged in users only*/}
            <Route path="/ranking" element={
              <ProtectedRoute><RankingPage /></ProtectedRoute>
              } />


            {/* 404 — must be last */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;