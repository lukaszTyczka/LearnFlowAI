import { useState, useCallback } from "react";
import { toast } from "sonner";
import type { Tables } from "../../db/database.types";
import type { AppUser } from "../../stores/authStore";

type Note = Tables<"notes">;

export function useNotes(user: AppUser | null) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
      } catch (err: any) {
        toast.error(err.message || "Failed to load notes");
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
      let summary = "";
      try {
        const summarizeResponse = await fetch("/api/ai/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: noteContent,
            maxLength: 500,
            categoryId: categoryId,
          }),
        });

        if (!summarizeResponse.ok) {
          const errorData = await summarizeResponse.json();
          console.error(
            "Summarization failed:",
            errorData.error || "Unknown error"
          );
          toast.warning("Could not generate summary, but saving note.");
        } else {
          const summarizeResult = await summarizeResponse.json();
          summary = summarizeResult.summary || "";
        }

        const response = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: noteContent,
            category_id: categoryId,
            summary: summary,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to save note");
        }

        toast.success("Note saved successfully");
        setNoteContent("");
        return true;
      } catch (err: any) {
        // Ensure a consistent error message for network or unexpected errors
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        console.error("Error during note saving process:", errorMessage, err);
        toast.error("Failed to save note. Please try again."); // Always show generic message
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
