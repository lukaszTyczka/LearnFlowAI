import type { APIRoute } from "astro";
import { OpenRouterService } from "../../../lib/api/openrouter/openRouter.service";
import { z } from "zod";

// Input validation schema
const SummarizeRequestSchema = z.object({
  text: z.string().min(1).max(32000),
  maxLength: z.number().int().min(50).max(1000).optional().default(150),
  categoryId: z.string().optional(),
});

// Output validation schema for structured responses
const SummaryResponseSchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
  wordCount: z.number(),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Check if user is authenticated
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Initialize OpenRouter service
    const openRouter = new OpenRouterService();

    // Parse and validate request body
    const body = await request.json();
    const { text, maxLength, categoryId } = SummarizeRequestSchema.parse(body);

    // Prepare the system message with instructions
    const systemMessage = `You are a professional summarizer. Create a concise summary of the provided text.
The summary should be no longer than ${maxLength} characters.
Focus on the main points and key information.`;

    // Request structured summary from OpenRouter
    const completion = await openRouter.createStructuredChatCompletion(
      {
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: text },
        ],
        temperature: 0.7,
      },
      SummaryResponseSchema,
      "generate_summary"
    );

    // Get the parsed and validated response
    const result = completion.getParsedJsonPayload();
    if (!result) {
      throw new Error("Failed to generate summary");
    }

    // Store the content and summary in the notes table
    const { data: noteData } = await locals.supabase
      .from("notes")
      .insert({
        content: text,
        summary: result.summary,
        user_id: locals.user.id,
        category_id: categoryId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    return new Response(
      JSON.stringify({
        ...result,
        noteId: noteData?.id, // Include the note ID if storage was successful
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: unknown) {
    // Handle different types of errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: "Invalid request data",
          details: error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Handle other types of errors
    const status = error instanceof Error ? 500 : 400;
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
