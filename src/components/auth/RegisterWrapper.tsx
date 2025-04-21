import React from "react";
import { AuthProvider } from "../../contexts/AuthContext";
import { RegisterForm } from "./RegisterForm";

/**
 * Wraps RegisterForm with its required AuthProvider.
 * This component will be rendered as the Astro island.
 */
export const RegisterWrapper: React.FC = () => {
  return (
    <AuthProvider>
      <RegisterForm />
    </AuthProvider>
  );
};
