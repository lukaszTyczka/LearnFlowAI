import React from "react";
import { AuthProvider } from "../../contexts/AuthContext";
import Dashboard from "./Dashboard"; // Assuming Dashboard.tsx is in the same directory
import type { Tables } from "../../db/database.types";

type Category = Tables<"categories">;

interface DashboardWrapperProps {
  categories: Category[];
}

/**
 * Wraps Dashboard with its required AuthProvider.
 * This component will be rendered as the Astro island.
 */
export const DashboardWrapper: React.FC<DashboardWrapperProps> = ({
  categories,
}) => {
  return (
    <AuthProvider>
      <Dashboard categories={categories} />
    </AuthProvider>
  );
};
