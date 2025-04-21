import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request, locals, url }) => {
  const supabase = locals.supabase;
  const { email } = await request.json();

  if (!email) {
    return new Response(JSON.stringify({ error: "Email is required" }), {
      status: 400,
    });
  }

  // Construct the redirect URL relative to the site origin
  // Ensure the path `/reset-password` exists as an Astro page or is handled client-side
  const redirectUrl = new URL("/reset-password", url.origin).toString();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  if (error) {
    console.error("Password reset error:", error.message);
    // Avoid leaking detailed error info to the client
    return new Response(
      JSON.stringify({
        error: "Failed to send reset email. Please try again.",
      }),
      {
        status: error.status || 500,
      }
    );
  }

  return new Response(
    JSON.stringify({ message: "Password reset email sent successfully." }),
    {
      status: 200,
    }
  );
};
