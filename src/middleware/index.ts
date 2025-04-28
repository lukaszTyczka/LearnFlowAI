import { defineMiddleware } from "astro:middleware";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
// import type { APIContext } from "astro"; // Removed unused import
import type { Database } from "../db/database.types";

// Define paths that require authentication
const protectedPaths = ["/app"];
// Define paths that should redirect if user is already logged in
const publicOnlyPaths = ["/login", "/register"];

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createServerClient<Database>(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_KEY,
    {
      cookies: {
        get(key: string) {
          return context.cookies.get(key)?.value;
        },
        set(key: string, value: string, options: CookieOptions) {
          context.cookies.set(key, value, {
            ...options,
            path: "/",
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: "lax",
          });
        },
        remove(key: string, options: CookieOptions) {
          context.cookies.delete(key, {
            ...options,
            path: "/",
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: "lax",
          });
        },
      },
    }
  );

  context.locals.supabase = supabase;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  context.locals.user = user;

  // --- Redirect logic ---
  const currentPath = context.url.pathname;

  // If user is not logged in and trying to access a protected path
  if (!user && protectedPaths.some((path) => currentPath.startsWith(path))) {
    return context.redirect("/login"); // Redirect to login page
  }

  // If user is logged in and trying to access a public-only path
  if (user && publicOnlyPaths.some((path) => currentPath.startsWith(path))) {
    // Redirect to the actual dashboard page, ensure this path exists
    return context.redirect("/app/dashboard");
  }

  // Proceed to the next middleware or page
  return next();
});
