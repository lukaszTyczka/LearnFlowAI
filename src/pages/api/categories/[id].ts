import type { APIContext } from "astro";

export async function GET(context: APIContext): Promise<Response> {
  const { locals, params } = context;
  const { supabase } = locals;
  const { id } = params;

  if (!supabase) {
    return new Response(JSON.stringify({ error: "Supabase client not available" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!id) {
    return new Response(JSON.stringify({ error: "Category ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { data: category, error } = await supabase
      .from("categories")
      .select("id, name, description, created_at")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return new Response(JSON.stringify({ error: "Category not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw error;
    }

    if (!category) {
      return new Response(JSON.stringify({ error: "Category not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ category }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Failed to fetch category" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
