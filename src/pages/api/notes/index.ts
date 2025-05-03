import type { APIRoute } from "astro";
import { ZodError } from "zod";
import { createNoteSchema } from "../../../lib/validators/notes"; // Assuming validator exists

export const GET: APIRoute = async ({ url, locals }) => {
  const { supabase, user } = locals;
  const categoryId = url.searchParams.get("categoryId");

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  if (!categoryId) {
    return new Response(JSON.stringify({ error: "categoryId is required" }), {
      status: 400,
    });
  }

  try {
    const { data: notes, error } = await supabase
      .from("notes")
      .select(
        `
        id, content, summary, created_at, updated_at, user_id, qa_status, qa_error_message, summary_status, summary_error_message,
        category:categories(id, name),
        qa_sets(
          id, created_at,
          questions(id, question_text, option_a, option_b, option_c, option_d, correct_option)
        )
      `
      )
      .eq("user_id", user.id)
      .eq("category_id", categoryId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ notes: notes || [] }), {
      status: 200,
    });
  } catch {
    return new Response(JSON.stringify({ error: "Failed to fetch notes" }), {
      status: 500,
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  const { supabase, user } = locals;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const body = await request.json();
    // Validate input using Zod schema
    const validatedData = createNoteSchema.parse(body);

    const { content, category_id } = validatedData;

    // Create note with pending summary status
    const { data: newNote, error } = await supabase
      .from("notes")
      .insert({
        content,
        category_id,
        user_id: user.id,
        summary_status: "pending",
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23503") {
        return new Response(JSON.stringify({ error: "Invalid category selected" }), { status: 400 });
      }
      throw error;
    }

    // Trigger async summarization
    fetch(`${request.url.replace("/api/notes", "/api/ai/summarize")}/${newNote.id}`, {
      method: "POST",
      headers: {
        Authorization: request.headers.get("Authorization") || "",
      },
    }).catch(/* It is handled in the summarize endpoint */);

    return new Response(JSON.stringify({ note: newNote }), { status: 201 });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return new Response(
        JSON.stringify({
          error: "Invalid input data",
          details: error.flatten(),
        }),
        {
          status: 400,
        }
      );
    }
    return new Response(JSON.stringify({ error: "Failed to create note" }), {
      status: 500,
    });
  }
};
