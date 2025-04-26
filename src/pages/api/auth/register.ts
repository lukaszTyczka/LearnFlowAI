import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, locals }) => {
  const supabase = locals.supabase;
  // TODO: Add proper validation (e.g., using Zod)
  const { email, password /* other registration data */ } = await request.json();

  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Email and password are required" }), {
      status: 400,
    });
  }

  // TODO: Add password strength checks

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // options: { data: { /* additional user metadata */ } }
  });

  if (error) {
    console.error("Registration error:", error.message);
    return new Response(JSON.stringify({ error: error.message || "Registration failed" }), {
      status: error.status || 500,
    });
  }

  // Depending on Supabase settings (email confirmation required?),
  // the user might not be logged in immediately.
  // If confirmation is required, just return success.
  // If auto-confirm is on, you might want to automatically log them in
  // by setting cookies like in login.ts.

  // For now, assume confirmation is needed or handled separately
  return new Response(
    JSON.stringify({
      message: "Registration successful. Please check your email for confirmation.",
      user: data.user,
    }),
    { status: 201 }
  );
};
