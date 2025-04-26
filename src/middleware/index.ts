import { defineMiddleware } from "astro:middleware";
import { supabaseClient } from "../db/supabase.client";
import type { APIContext } from "astro";

// Define paths that require authentication
const protectedPaths = ["/app"];
// Define paths that should redirect if user is already logged in
const publicOnlyPaths = ["/login", "/register"];

// Helper function to set auth cookies
function setAuthCookies(context: APIContext, session: { access_token: string; refresh_token: string }) {
  context.cookies.set("sb-access-token", session.access_token, {
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // Example: 7 days
    httpOnly: true,
    secure: import.meta.env.PROD, // Use secure cookies in production
    sameSite: "lax",
  });
  context.cookies.set("sb-refresh-token", session.refresh_token, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // Example: 30 days
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax",
  });
}

export const onRequest = defineMiddleware(async (context, next) => {
  // Inject Supabase client
  context.locals.supabase = supabaseClient;

  const accessToken = context.cookies.get("sb-access-token")?.value;
  const refreshToken = context.cookies.get("sb-refresh-token")?.value;

  let user = null;

  if (accessToken && refreshToken) {
    // Set the session for the client to use
    const { data } = await supabaseClient.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (data?.session) {
      user = data.user;
      if (data.session.access_token !== accessToken || data.session.refresh_token !== refreshToken) {
        setAuthCookies(context, data.session);
      }
    } else {
      const { data: refreshData, error: refreshError } = await supabaseClient.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (refreshError) {
        context.cookies.delete("sb-access-token", { path: "/" });
        context.cookies.delete("sb-refresh-token", { path: "/" });
      } else if (refreshData?.session) {
        user = refreshData.user;
        setAuthCookies(context, refreshData.session);
      } else {
        context.cookies.delete("sb-access-token", { path: "/" });
        context.cookies.delete("sb-refresh-token", { path: "/" });
      }
    }
  } else {
    const { data } = await supabaseClient.auth.getUser();
    user = data?.user ?? null;
  }

  // Add user to locals
  context.locals.user = user;

  // --- Redirect logic ---
  const currentPath = context.url.pathname;

  // If user is not logged in and trying to access a protected path
  if (!user && protectedPaths.some((path) => currentPath.startsWith(path))) {
    return context.redirect("/login"); // Redirect to login page
  }

  // If user is logged in and trying to access a public-only path
  if (user && publicOnlyPaths.some((path) => currentPath.startsWith(path))) {
    return context.redirect("/app/dashboard"); // Redirect to the actual dashboard page
  }

  // Proceed to the next middleware or page
  return next();
});
