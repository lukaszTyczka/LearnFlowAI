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
        console.error("Error loading notes:", err);
        toast.error(err.message || "Failed to load notes");
        setNotes([]);
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  const saveNote = useCallback(
    async (categoryId: string | null) => {
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
        const response = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: noteContent,
            category_id: categoryId,
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
        console.error("Error saving note:", err);
        toast.error(err.message || "Failed to save note. Please try again.");
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
