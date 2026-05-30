// App: main application component.
// Wraps the app in AuthProvider so all routes have access to auth state,
// and defines the route structure.

import { Routes, Route, Navigate } from "react-router";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import PageLayout from "./components/PageLayout.jsx";
import LoginForm from "./components/LoginForm.jsx";
import NotFound from "./components/NotFound.jsx";
import "./index.css";

// Placeholder for the main page (replace this with your exam-specific component).
function MainPage() {
  const { user } = useAuth();
  return (
    <div>
      <h2>Home</h2>
      {user ? (
        <p>Logged in as <strong>{user.name}</strong> ({user.email})</p>
      ) : (
        <p>You are not logged in. Click <strong>Login</strong> in the navbar to access the app.</p>
      )}
    </div>
  );
}

// Protected route wrapper: redirects to /login if user is not authenticated.
// Use this around routes that require login.
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading...</p>; // wait for initial session check
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PageLayout />}>
            {/* Public route */}
            <Route path="/login" element={<LoginForm />} />

            {/* Home route — currently open to all, but you can wrap with ProtectedRoute */}
            <Route path="/" element={<MainPage />} />

            {/* TODO EXAM: add protected routes like:
                <Route path="/items" element={
                  <ProtectedRoute><ItemsPage /></ProtectedRoute>
                } />
            */}

            {/* 404 — must be last */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;