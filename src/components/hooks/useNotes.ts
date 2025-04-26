import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { Database } from "../../db/database.types";
import type { Tables } from "../../db/database.types";
import type { AppUser } from "../../stores/authStore";
import { supabaseClient } from "../../db/supabase.client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type Note = Tables<"notes"> & {
  summary_status: "pending" | "processing" | "completed" | "failed";
  summary_error_message?: string | null;
};

export function useNotes(user: AppUser | null) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Setup realtime subscription for notes updates
  useEffect(() => {
    if (!user) return;

    let subscription: ReturnType<typeof supabaseClient.channel> | null = null;

    try {
      subscription = supabaseClient
        .channel("notes_changes")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notes",
            filter: `user_id=eq.${user.id}`,
          },
          (
            payload: RealtimePostgresChangesPayload<
              Database["public"]["Tables"]["notes"]["Row"] & {
                summary_status: Note["summary_status"];
                summary_error_message?: string | null;
              }
            >
          ) => {
            const updatedNote = payload.new as Note;
            setNotes((currentNotes) => currentNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note)));

            // Show appropriate toast based on summary status
            if (updatedNote.summary_status === "completed") {
              toast.success("Note summary generated successfully");
            } else if (updatedNote.summary_status === "failed") {
              toast.error(`Summary generation failed: ${updatedNote.summary_error_message || "Unknown error"}`);
            }
          }
        )
        .subscribe();
    } catch {
      // Do nothing
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [user]);

  const loadNotes = useCallback(
    async (categoryId: string | null) => {
      if (!categoryId || !user) {
        setNotes([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/notes?categoryId=${categoryId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to load notes");
        }
        const fetchedNotes = await response.json();
        setNotes(fetchedNotes.notes || []);
        setSelectedNote(null);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to load notes");
        setNotes([]);
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const saveNote = useCallback(
    async (categoryId: string | null): Promise<boolean> => {
      if (!user) {
        toast.error("You must be logged in to save notes");
        return false;
      }

      if (!categoryId) {
        toast.error("Please select a category first");
        return false;
      }

      if (noteContent.length < 300 || noteContent.length > 10000) {
        toast.error("Note must be between 300 and 10000 characters");
        return false;
      }

      setIsSaving(true);
      try {
        // First, save the note with pending status
        const saveResponse = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: noteContent,
            category_id: categoryId,
            summary_status: "pending",
          }),
        });

        if (!saveResponse.ok) {
          const errorData = await saveResponse.json();
          throw new Error(errorData.error || "Failed to save note");
        }

        const { note } = await saveResponse.json();

        // Add the new note to the list immediately with proper typing
        setNotes((currentNotes) => [note as Note, ...currentNotes]);
        // Clear the text area immediately after successful save
        setNoteContent("");
        // Display success message for saving
        toast.success("Note saved successfully. Generating summary...");

        // Then trigger summarization
        const summarizeResponse = await fetch(`/api/ai/summarize/${note.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!summarizeResponse.ok) {
          // Update toast if summarization initiation fails
          toast.warning("Note saved, but failed to start summary generation. You can retry later.");
        }

        return true;
      } catch (err: unknown) {
        // Explicitly type error
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
        toast.error(`Failed to save note: ${errorMessage}. Please try again.`);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [noteContent, user]
  );

  return {
    notes,
    isLoading,
    selectedNote,
    setSelectedNote,
    noteContent,
    setNoteContent,
    isSaving,
    loadNotes,
    saveNote,
  };
}
