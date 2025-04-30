import type { APIRoute } from "astro";
import { z } from "zod";

const UUIDSchema = z.string().uuid({ message: "Invalid note ID format." });

export const GET: APIRoute = async ({ params, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

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

    if (error) {
      return new Response(JSON.stringify({ error: "Database error fetching note." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!note) {
      return new Response(JSON.stringify({ error: "Note not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

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
  if (!locals.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

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
    const { error } = await locals.supabase.from("notes").delete().eq("id", validId);

    if (error) {
      return new Response(JSON.stringify({ error: "Database error deleting note." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(null, {
      status: 204, // No Content - Success
    });
  } catch {
    return new Response(JSON.stringify({ error: "Internal server error." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
