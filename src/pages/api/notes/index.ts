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
      .select("*") // Select specific fields if needed
      .eq("user_id", user.id)
      .eq("category_id", categoryId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ notes: notes || [] }), {
      status: 200,
    });
  } catch (error: any) {
    console.error("Error fetching notes:", error.message);
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
      console.error("Supabase error creating note:", error);
      if (error.code === "23503") {
        return new Response(
          JSON.stringify({ error: "Invalid category selected" }),
          { status: 400 }
        );
      }
      throw error;
    }

    // Trigger async summarization
    fetch(
      `${request.url.replace("/api/notes", "/api/ai/summarize")}/${newNote.id}`,
      {
        method: "POST",
        headers: {
          Authorization: request.headers.get("Authorization") || "",
        },
      }
    ).catch((error) => {
      console.error("Failed to trigger summarization:", error);
      // Don't wait for or fail on summarization errors
    });

    return new Response(JSON.stringify({ note: newNote }), { status: 201 });
  } catch (error: any) {
    if (error instanceof ZodError) {
      console.error("Validation error creating note:", error.errors);
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
    console.error("Error creating note:", error.message);
    return new Response(JSON.stringify({ error: "Failed to create note" }), {
      status: 500,
    });
  }
};
