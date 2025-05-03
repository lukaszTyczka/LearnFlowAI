import type { APIRoute } from "astro";
import { OpenRouterService } from "../../../../lib/api/openrouter/openRouter.service";
import { z } from "zod";

// Output validation schema for structured responses
const SummaryResponseSchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
  wordCount: z.number(),
});

// Custom error class for better error handling
class SummarizeError extends Error {
  constructor(
    message: string,
    public status = 500,
    public userMessage?: string
  ) {
    super(message);
    this.name = "SummarizeError";
  }
}

export const POST: APIRoute = async ({ params, locals }) => {
  const { supabase, user } = locals;

  if (!params.id) {
    throw new SummarizeError("Note ID is required", 400);
  }

  const noteId = params.id;

  try {
    // Check if user is authenticated
    if (!user) {
      throw new SummarizeError("Authentication required", 401, "Please log in to generate summaries");
    }

    // Check if note is already being processed
    const { data: existingNote, error: checkError } = await supabase
      .from("notes")
      .select("summary_status")
      .eq("id", noteId)
      .eq("user_id", user.id)
      .single();

    if (checkError) {
      throw new SummarizeError(
        `Failed to check note status: ${checkError.message}`,
        404,
        "Note not found or access denied"
      );
    }

    if (existingNote.summary_status === "processing") {
      throw new SummarizeError(
        "Note is already being processed",
        409,
        "This note is already being summarized. Please wait."
      );
    }

    // Fetch the complete note
    const { data: note, error: noteError } = await supabase
      .from("notes")
      .select("*")
      .eq("id", noteId)
      .eq("user_id", user.id)
      .single();

    if (noteError || !note) {
      throw new SummarizeError(
        `Failed to fetch note: ${noteError?.message || "Note not found"}`,
        404,
        "Note not found or access denied"
      );
    }

    // Validate note content
    if (!note.content || note.content.length < 300) {
      throw new SummarizeError(
        "Note content is too short for summarization",
        400,
        "Note content must be at least 300 characters long to generate a summary"
      );
    }

    // Update status to processing
    const { error: statusError } = await supabase
      .from("notes")
      .update({
        summary_status: "processing" as const,
        summary_error_message: null, // Clear any previous error message
        updated_at: new Date().toISOString(),
      })
      .eq("id", noteId)
      .eq("user_id", user.id);

    if (statusError) {
      throw new SummarizeError(
        `Failed to update note status: ${statusError.message}`,
        500,
        "Failed to start summarization process"
      );
    }

    // Get the API key from Cloudflare environment variables
    const openRouterApiKey = locals.runtime?.env?.OPENROUTER_API_KEY;

    // Initialize OpenRouter service with the API key from locals
    const openRouter = new OpenRouterService({ apiKey: openRouterApiKey });

    // Prepare the system message with instructions
    const systemMessage = `You are a professional summarizer. Create a concise summary of the provided text.
The summary should be no longer than 150 characters.
Focus on the main points and key information.`;

    try {
      // Request structured summary from OpenRouter
      const completion = await openRouter.createStructuredChatCompletion(
        {
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: note.content },
          ],
          temperature: 0.7,
        },
        SummaryResponseSchema,
        "generate_summary"
      );

      // Get the parsed and validated response
      const result = completion.getParsedJsonPayload();
      if (!result) {
        throw new Error("AI model returned invalid response format");
      }

      // Update the note with the summary and status
      const { error: updateError } = await supabase
        .from("notes")
        .update({
          summary: result.summary,
          summary_status: "completed" as const,
          summary_error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", noteId)
        .eq("user_id", user.id);

      if (updateError) {
        throw new SummarizeError(
          `Failed to save summary: ${updateError.message}`,
          500,
          "Failed to save the generated summary"
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          noteId,
          summary: result.summary,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (aiError) {
      // Handle AI-specific errors
      throw new SummarizeError(
        `AI summarization failed: ${aiError instanceof Error ? aiError.message : "Unknown error"}`,
        500,
        "Failed to generate summary. The AI model encountered an error."
      );
    }
  } catch (error) {
    const summarizeError =
      error instanceof SummarizeError
        ? error
        : new SummarizeError(
            error instanceof Error ? error.message : "Unknown error occurred",
            500,
            "An unexpected error occurred while generating the summary"
          );

    // Update note status to failed with appropriate error message
    if (user) {
      await supabase
        .from("notes")
        .update({
          summary_status: "failed" as const,
          summary_error_message: summarizeError.userMessage || summarizeError.message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", noteId)
        .eq("user_id", user.id);
    }

    return new Response(
      JSON.stringify({
        error: summarizeError.userMessage || summarizeError.message,
        details: summarizeError.message,
      }),
      {
        status: summarizeError.status,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
