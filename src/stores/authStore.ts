import { atom } from "nanostores";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";

export type AppUser = Pick<User, "id" | "email"> & {
  user_metadata?: { [key: string]: any };
};

export const $user = atom<AppUser | null>(null);
export const $isAuthLoading = atom<boolean>(false);
export const $authError = atom<string | null>(null);
export const $isInitialized = atom<boolean>(false);

export function setUser(user: AppUser | null) {
  console.log("setting user", user);
  $user.set(user);
  if (!$isInitialized.get()) {
    $isInitialized.set(true);
    console.log("isInitialized", $isInitialized.get());
  }
  $isAuthLoading.set(false);
}

export async function fetchInitialUser() {
  if ($isInitialized.get()) return;

  $isAuthLoading.set(true);
  $authError.set(null);
  try {
    const response = await fetch("/api/auth/session");
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        setUser(null);
      } else {
        throw new Error(data.error || "Failed to fetch session");
      }
    } else {
      setUser(data.user ?? null);
    }
  } catch (error: any) {
    console.error("Error fetching initial user session:", error);
    $authError.set(error.message || "Failed to fetch session");
    setUser(null);
  } finally {
    $isAuthLoading.set(false);
    if (!$isInitialized.get()) {
      $isInitialized.set(true);
    }
  }
}

export async function login(email: string, password: string): Promise<boolean> {
  $isAuthLoading.set(true);
  $authError.set(null);
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    if (data.user) {
      setUser(data.user);
      toast.success("Logged in successfully!");
      return true;
    } else {
      await fetchInitialUser();
      if ($user.get()) {
        toast.success("Logged in successfully!");
        return true;
      } else {
        throw new Error("Login succeeded but failed to retrieve user session.");
      }
    }
  } catch (error: any) {
    console.error("Login error:", error);
    const errorMessage =
      error.message || "Login failed. Please check your credentials.";
    $authError.set(errorMessage);
    toast.error(errorMessage);
    setUser(null);
    return false;
  } finally {
    $isAuthLoading.set(false);
  }
}

// Logout function
export async function logout(): Promise<boolean> {
  $isAuthLoading.set(true);
  $authError.set(null);
  try {
    const response = await fetch("/api/auth/logout", { method: "POST" }); // Use API endpoint

    if (!response.ok) {
      console.error("Logout API call failed, status:", response.status);
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Logout failed on server");
    }

    setUser(null);
    toast.success("Logged out successfully!");
    return true;
  } catch (error: any) {
    console.error("Logout error:", error);
    const errorMessage = error.message || "Logout failed.";
    $authError.set(errorMessage);
    toast.error(errorMessage);
    setUser(null);
    return false;
  } finally {
    $isAuthLoading.set(false);
  }
}

// Sign up function
export async function signUp(
  email: string,
  password: string
): Promise<{ success: boolean; message: string }> {
  $isAuthLoading.set(true);
  $authError.set(null);
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Registration failed");
    }

    const message =
      data.message ||
      "Registration successful! Check email if confirmation needed.";
    toast.success(message);
    return { success: true, message };
  } catch (error: any) {
    console.error("Signup error:", error);
    const errorMessage =
      error.message || "Registration failed. Please try again.";
    $authError.set(errorMessage);
    toast.error(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    $isAuthLoading.set(false);
  }
}

export async function requestPasswordReset(
  email: string
): Promise<{ success: boolean; message: string }> {
  $isAuthLoading.set(true);
  $authError.set(null);
  try {
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to send password reset email.");
    }

    const message = data.message || "Password reset instructions sent.";
    toast.success(message);
    return { success: true, message };
  } catch (error: any) {
    console.error("Password reset request error:", error);
    const errorMessage =
      error.message || "Failed to send password reset email.";
    $authError.set(errorMessage);
    toast.error(errorMessage);
    return { success: false, message: errorMessage };
  } finally {
    $isAuthLoading.set(false);
  }
}
