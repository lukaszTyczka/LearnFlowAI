import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const supabase = locals.supabase;
  const { email, password } = await request.json();

  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Email and password are required" }), {
      status: 400,
    });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login error:", error.message);
    return new Response(JSON.stringify({ error: error.message || "Login failed" }), {
      status: error.status || 500,
    });
  }

  if (data.session) {
    // Set cookies (similar logic as in middleware, maybe refactor to a helper)
    cookies.set("sb-access-token", data.session.access_token, {
      path: "/",
      maxAge: data.session.expires_in,
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "lax",
    });
    cookies.set("sb-refresh-token", data.session.refresh_token, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "lax", // Assuming longer refresh token validity
    });
    return new Response(JSON.stringify({ user: data.user }), { status: 200 });
  } else {
    return new Response(
      JSON.stringify({
        error: "Login successful but no session data received",
      }),
      {
        status: 500,
      }
    );
  }
};
