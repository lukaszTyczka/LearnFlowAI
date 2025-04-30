import type { APIRoute } from "astro";
import { z } from "zod";

// Basic UUID validation schema
const UUIDSchema = z.string().uuid({ message: "Invalid note ID format." });

export const GET: APIRoute = async ({ params, locals }) => {
  // 1. Verify authentication
  if (!locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Extract and validate ID
  const id = params.id;
  const validationResult = UUIDSchema.safeParse(id);

  if (!validationResult.success) {
    return new Response(JSON.stringify({ error: validationResult.error.errors[0].message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const validId = validationResult.data;

  try {
    // 3. Fetch note from Supabase
    // RLS ensures user can only fetch their own note
    const { data: note, error } = await locals.supabase
      .from("notes")
      .select(
        `
        id, content, summary, created_at,
        category:categories(id, name),
        qa_sets(id, questions(id, question_text, answer_text))
      `
      )
      .eq("id", validId)
      .maybeSingle();

    // 4. Handle potential errors or not found
    if (error) {
      return new Response(JSON.stringify({ error: "Database error fetching note." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!note) {
      // Note not found or RLS prevented access
      return new Response(JSON.stringify({ error: "Note not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 5. Return note details
    return new Response(JSON.stringify(note), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Internal server error." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const DELETE: APIRoute = async ({ params, locals }) => {
  // 1. Verify authentication
  if (!locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Extract and validate ID
  const id = params.id;
  const validationResult = UUIDSchema.safeParse(id);

  if (!validationResult.success) {
    return new Response(JSON.stringify({ error: validationResult.error.errors[0].message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const validId = validationResult.data;

  try {
    // 3. Delete note from Supabase
    // RLS ensures user can only delete their own note
    // Cascade delete is handled by DB foreign key constraints
    const { error, count } = await locals.supabase.from("notes").delete().eq("id", validId);

    // 4. Handle potential database errors
    if (error) {
      return new Response(JSON.stringify({ error: "Database error deleting note." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 5. Check if a note was actually deleted
    if (count === 0 || count === null) {
      // Note not found or RLS prevented deletion
      return new Response(JSON.stringify({ error: "Note not found or access denied." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 6. Return success (No Content)
    return new Response(null, {
      status: 204,
    });
  } catch {
    return new Response(JSON.stringify({ error: "Internal server error." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
