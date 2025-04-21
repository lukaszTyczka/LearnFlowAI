import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
// Remove direct Supabase type imports if no longer needed for context state signature
// import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
// Keep User type if needed for the state shape
import type { User } from "@supabase/supabase-js";
// Remove useSupabase import
// import { useSupabase } from "./SupabaseContext";

// Define a simpler user type for frontend state if needed, or use Supabase User
// Adjust based on what /api/auth/session returns
type AppUser = Pick<User, "id" | "email"> & {
  user_metadata?: { [key: string]: any };
};

interface AuthState {
  user: AppUser | null; // Use the simplified type
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

interface AuthContextType extends AuthState {
  // Keep function signatures the same for components using the context
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  refetchUser: () => Promise<void>; // Add a function to manually refetch user state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Remove Supabase client from context
  // const { supabase } = useSupabase();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true, // Start loading until session is checked
    error: null,
    isInitialized: false,
  });

  // Fetch user session state from the API endpoint
  const fetchUserSession = useCallback(async () => {
    if (!state.isInitialized) {
      // Only set loading true on initial load
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
    }
    try {
      const response = await fetch("/api/auth/session");
      if (response.ok) {
        const data = await response.json();
        setState((prev) => ({
          ...prev,
          user: data.user, // Assuming API returns { user: AppUser | null }
          isLoading: false,
          isInitialized: true,
          error: null,
        }));
      } else if (response.status === 401) {
        // Not authenticated
        setState((prev) => ({
          ...prev,
          user: null,
          isLoading: false,
          isInitialized: true,
          error: null,
        }));
      } else {
        // Other errors
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch session");
      }
    } catch (error: any) {
      console.error("Failed to fetch user session:", error);
      setState((prev) => ({
        ...prev,
        user: null, // Assume logged out on error
        error: error.message || "Failed to fetch session state",
        isLoading: false,
        isInitialized: true,
      }));
    }
  }, [state.isInitialized]); // Depend on isInitialized to control initial loading state

  useEffect(() => {
    fetchUserSession();
    // Remove the onAuthStateChange listener
  }, [fetchUserSession]); // Fetch session on mount

  const login = async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }
      // Fetch user session again to update state after successful login
      await fetchUserSession();
    } catch (error: any) {
      console.error("Login error:", error);
      setState((prev) => ({ ...prev, error: error.message || "Login failed" }));
    } finally {
      // isLoading will be set to false by fetchUserSession
      // setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const logout = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      await fetch("/api/auth/logout", { method: "POST" });

      // No need to check response.ok, just clear user state and let middleware handle redirect
      // if (!response.ok) {
      //   // Handle potential errors if needed, though clearing state is usually sufficient
      // }

      setState((prev) => ({
        ...prev,
        user: null,
        isLoading: false,
        error: null,
      }));
      // Let Astro middleware handle the redirect, but potentially force a client-side one if needed
      // window.location.href = '/login';
    } catch (error: any) {
      console.error("Logout error:", error);
      // Still clear user state on error
      setState((prev) => ({
        ...prev,
        user: null,
        error: error.message || "Logout failed",
        isLoading: false,
      }));
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }
      // Registration successful, maybe show a message from `data.message`
      // State doesn't necessarily change until user confirms email and logs in
      console.log(data.message);
      // Optionally trigger a state update to show a "check email" message
    } catch (error: any) {
      console.error("Signup error:", error);
      setState((prev) => ({
        ...prev,
        error: error.message || "Registration failed",
      }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        signUp,
        refetchUser: fetchUserSession, // Expose refetch function
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
