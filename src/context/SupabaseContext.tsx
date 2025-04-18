import React, { createContext, useContext } from "react";
import { supabaseClient, type SupabaseClient } from "../db/supabase.client";
import type { Database } from "../db/database.types";

interface SupabaseContextType {
  supabase: SupabaseClient<Database>;
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(
  undefined
);

export const SupabaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <SupabaseContext.Provider value={{ supabase: supabaseClient }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = (): SupabaseContextType => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
};
