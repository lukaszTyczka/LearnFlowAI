import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ locals, cookies, redirect }) => {
  const supabase = locals.supabase;

  const { error } = await supabase.auth.signOut();

  if (error) {
    return new Response(JSON.stringify({ error: "Logout failed on server" }), { status: 499 });
  }

  // Clear cookies regardless of signout error
  cookies.delete("sb-access-token", { path: "/" });
  cookies.delete("sb-refresh-token", { path: "/" });

  // Redirect to login page after logout
  return redirect("/login", 302);
};
