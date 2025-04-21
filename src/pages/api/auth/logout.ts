import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ locals, cookies, redirect }) => {
  const supabase = locals.supabase;

  const { error } = await supabase.auth.signOut();

  // Clear cookies regardless of signout error
  cookies.delete("sb-access-token", { path: "/" });
  cookies.delete("sb-refresh-token", { path: "/" });

  if (error) {
    console.error("Logout error:", error.message);
    // Even if Supabase signout fails, we cleared cookies, so redirect
    // Optionally return an error response instead
    // return new Response(JSON.stringify({ error: 'Logout failed on server' }), { status: 500 });
  }

  // Redirect to login page after logout
  return redirect("/login", 302);
};
