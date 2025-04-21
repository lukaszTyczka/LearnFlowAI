import React from "react";
import { AuthProvider } from "../../contexts/AuthContext";
import { LoginForm } from "./LoginForm";

/**
 * Wraps LoginForm with its required AuthProvider.
 * This component will be rendered as the Astro island.
 */
export const LoginWrapper: React.FC = () => {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
};
