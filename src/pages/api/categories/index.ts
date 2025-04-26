import type { APIContext } from "astro";
import type { Tables } from "../../../db/database.types"; // Adjust path as needed

// Define a type alias for Category using the generated types
type Category = Tables<"categories">;

export async function GET(context: APIContext): Promise<Response> {
  const { locals } = context;
  const { supabase } = locals; // Assuming middleware sets these

  // Basic check if supabase client is available
  if (!supabase) {
    return new Response(JSON.stringify({ error: "Supabase client not available" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Optional: Check if user needs to be logged in to view categories
  // if (!user) {
  //   return new Response(JSON.stringify({ error: "Unauthorized" }), {
  //     status: 401,
  //     headers: { 'Content-Type': 'application/json' },
  //   });
  // }

  try {
    // Fetch all categories, ensuring all fields required by the Category type are selected
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, description, created_at, updated_at") // Added updated_at
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Supabase error fetching categories:", error);
      throw error; // Let the catch block handle it
    }

    // Explicitly type the result for clarity, though TS should infer it
    const categories: Category[] = data || [];

    // Return the fetched categories
    return new Response(JSON.stringify({ categories }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in /api/categories:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to fetch categories" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Placeholder for POST if needed later
// export async function POST(context: APIContext): Promise<Response> { ... }
