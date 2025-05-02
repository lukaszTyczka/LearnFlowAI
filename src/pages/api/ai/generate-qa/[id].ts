import type { APIRoute } from "astro";
import {
  OpenRouterService,
  OpenRouterApiError,
  JsonParsingError,
} from "../../../../lib/api/openrouter/openRouter.service";
import { GeneratedQASchema, type GeneratedQA } from "../../../../lib/validators/aiValidators";
import type { z } from "zod";

// Custom error class for better error handling
class GenerateQAError extends Error {
  constructor(
    message: string,
    public status = 500,
    public userMessage?: string
  ) {
    super(message);
    this.name = "GenerateQAError";
  }
}

export const POST: APIRoute = async ({ params, locals }) => {
  const { supabase, user } = locals;

  if (!params.id) {
    throw new GenerateQAError("Note ID is required", 400);
  }

  const noteId = params.id;

  try {
    // Check if user is authenticated
    if (!user) {
      throw new GenerateQAError("Authentication required", 401, "Please log in to generate Q&A");
    }

    // Check if note is already being processed
    const { data: existingNote, error: checkError } = await supabase
      .from("notes")
      .select("qa_status")
      .eq("id", noteId)
      .eq("user_id", user.id)
      .single();

    if (checkError) {
      throw new GenerateQAError(
        `Failed to check note status: ${checkError.message}`,
        404,
        "Note not found or access denied"
      );
    }

    if (existingNote.qa_status === "processing") {
      throw new GenerateQAError(
        "Note is already being processed",
        409,
        "This note is already being processed for Q&A generation. Please wait."
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
      throw new GenerateQAError(
        `Failed to fetch note: ${noteError?.message || "Note not found"}`,
        404,
        "Note not found or access denied"
      );
    }

    // Validate note content
    if (!note.content || note.content.length < 300) {
      throw new GenerateQAError(
        "Note content is too short for Q&A generation",
        400,
        "Note content must be at least 300 characters long to generate Q&A"
      );
    }

    // Update status to processing
    const { error: statusError } = await supabase
      .from("notes")
      .update({
        qa_status: "processing" as const,
        qa_error_message: null, // Clear any previous error message
        updated_at: new Date().toISOString(),
      })
      .eq("id", noteId)
      .eq("user_id", user.id);

    if (statusError) {
      throw new GenerateQAError(
        `Failed to update note status: ${statusError.message}`,
        500,
        "Failed to start Q&A generation process"
      );
    }

    // Initialize OpenRouter service
    const openRouter = new OpenRouterService();

    // Prepare the system message with instructions
    const systemMessage = `You are a professional educator and question generator.
Create multiple choice questions (ABCD format) based on the provided text content.
Each question should:
1. Test understanding of key concepts and important details from the text
2. Have exactly 4 options (A, B, C, D)
3. Have one clear correct answer
4. Be challenging but fair
5. Be clear and unambiguous
6. Cover different aspects of the content to ensure comprehensive understanding
7. Use proper grammar and professional language
8. Avoid trick questions or deliberately misleading options
9. Include at least one question that tests higher-order thinking skills

Generate at least 3 questions, but no more than 5 questions.
Each incorrect option should be plausible but clearly incorrect when compared to the text.

Format each question as a JSON object with:
- question: the question text
- options: object with A, B, C, D keys for each option
- correct_option: the letter of the correct answer (A, B, C, or D)`;

    try {
      // Request structured Q&A from OpenRouter
      const completion = await openRouter.createStructuredChatCompletion(
        {
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: note.content },
          ],
          temperature: 0.7,
        },
        GeneratedQASchema,
        "generate_qa"
      );

      // Get the parsed and validated response
      const result = completion.getParsedJsonPayload();
      if (!result) {
        throw new Error("AI model returned invalid response format");
      }

      // First create a QA set
      const { data: qaSet, error: qaSetError } = await supabase
        .from("qa_sets")
        .insert({
          note_id: noteId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (qaSetError || !qaSet) {
        throw new Error(`Failed to create QA set: ${qaSetError?.message}`);
      }

      // Then insert questions linked to the QA set
      const { error: qaError } = await supabase.from("questions").insert(
        (result as z.infer<typeof GeneratedQASchema>).map((qa: GeneratedQA) => ({
          qa_set_id: qaSet.id,
          question_text: qa.question,
          option_a: qa.options.A,
          option_b: qa.options.B,
          option_c: qa.options.C,
          option_d: qa.options.D,
          correct_option: qa.correct_option,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))
      );

      if (qaError) {
        throw new Error(`Failed to save Q&A data: ${qaError.message}`);
      }

      // Update the note status to completed
      const { error: updateError } = await supabase
        .from("notes")
        .update({
          qa_status: "completed" as const,
          qa_error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", noteId)
        .eq("user_id", user.id);

      if (updateError) {
        throw new Error(`Failed to update note status: ${updateError.message}`);
      }

      return new Response(
        JSON.stringify({
          success: true,
          noteId,
          message: "Q&A generation started successfully",
        }),
        {
          status: 202,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (aiError) {
      // Handle AI-specific errors
      if (aiError instanceof OpenRouterApiError) {
        throw new GenerateQAError(
          `OpenRouter API Error: ${aiError.message}`,
          aiError.status || 500,
          aiError.status === 429
            ? "AI service is currently busy. Please try again in a few minutes."
            : "Failed to generate Q&A. The AI service encountered an error."
        );
      }

      if (aiError instanceof JsonParsingError) {
        throw new GenerateQAError(
          `AI response parsing error: ${aiError.message}`,
          500,
          "Failed to process AI response. Please try again."
        );
      }

      throw new GenerateQAError(
        `AI Q&A generation failed: ${aiError instanceof Error ? aiError.message : "Unknown error"}`,
        500,
        "Failed to generate Q&A. Please try again later."
      );
    }
  } catch (error) {
    const generateQAError =
      error instanceof GenerateQAError
        ? error
        : new GenerateQAError(
            error instanceof Error ? error.message : "Unknown error occurred",
            500,
            "An unexpected error occurred while generating Q&A"
          );

    // Update note status to failed with appropriate error message
    if (user) {
      await supabase
        .from("notes")
        .update({
          qa_status: "failed" as const,
          qa_error_message: generateQAError.userMessage || generateQAError.message,
          updated_at: new Date().toISOString(),
        })
        .eq("id", noteId)
        .eq("user_id", user.id);
    }

    return new Response(
      JSON.stringify({
        error: generateQAError.userMessage || generateQAError.message,
        details: generateQAError.message,
      }),
      {
        status: generateQAError.status,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
