import type { APIRoute } from "astro";

// This endpoint returns the current user session based on the middleware verification
export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;

  if (!user) {
    return new Response(JSON.stringify({ user: null, error: "Not authenticated" }), {
      status: 401,
    });
  }

  // Return relevant user information (avoid sending sensitive data)
  const userInfo = {
    id: user.id,
    email: user.email,
    // Add other non-sensitive fields if needed
    // e.g., user_metadata: user.user_metadata
  };

  return new Response(JSON.stringify({ user: userInfo }), { status: 200 });
};
