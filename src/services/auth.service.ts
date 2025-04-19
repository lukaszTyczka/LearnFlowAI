import { supabaseClient } from "../db/supabase.client";

interface AuthError extends Error {
  message: string;
  status?: number;
}

class AuthService {
  async signInWithPassword(email: string, password: string) {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw this.handleError(error);
      }

      return data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async signOut() {
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) {
        throw this.handleError(error);
      }
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async signUp(email: string, password: string) {
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw this.handleError(error);
      }

      return data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): AuthError {
    const authError: AuthError = new Error(
      error.message || "An unexpected error occurred"
    );
    if (error.status) {
      authError.status = error.status;
    }
    return authError;
  }
}

export default new AuthService();
