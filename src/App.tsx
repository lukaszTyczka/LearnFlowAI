import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LoginForm } from "./components/auth/LoginForm";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { HomePage } from "./components/HomePage";
import { Toaster } from "sonner";
import "./App.css";
import Dashboard from "./components/Dashboard";
import { RegisterForm } from "./components/auth/RegisterForm";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster richColors />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
