import { supabaseClient } from "../db/supabase.client";
import type { Database } from "../db/database.types";

export type Note = Database["public"]["Tables"]["notes"]["Row"];
export type CreateNoteDTO = Omit<Note, "id" | "created_at" | "updated_at">;

class NotesService {
  async createNote(note: CreateNoteDTO): Promise<Note> {
    const { data, error } = await supabaseClient
      .from("notes")
      .insert({
        content: note.content,
        category_id: note.category_id,
        user_id: note.user_id,
        summary: note.summary,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating note: ${error.message}`);
    }

    return data as Note;
  }

  async getNotesByCategory(
    categoryId: string,
    userId: string
  ): Promise<Note[]> {
    const { data, error } = await supabaseClient
      .from("notes")
      .select("*")
      .eq("category_id", categoryId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Error fetching notes by category: ${error.message}`);
    }

    return data as Note[];
  }
}

export default new NotesService();
