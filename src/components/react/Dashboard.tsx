import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { Card } from "../ui/card";
import type { Tables } from "../../db/database.types";
type Category = Tables<"categories">;
type Note = Tables<"notes">;
import { toast } from "sonner";

interface DashboardProps {
  categories: Category[];
}

const DashboardReact: React.FC<DashboardProps> = ({
  categories: initialCategories,
}) => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  useEffect(() => {
    if (initialCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(initialCategories[0].id);
    }
  }, [initialCategories, selectedCategory]);

  const loadNotes = useCallback(async () => {
    if (!selectedCategory || !user) {
      setNotes([]);
      return;
    }

    setIsLoadingNotes(true);
    try {
      const response = await fetch(`/api/notes?categoryId=${selectedCategory}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load notes");
      }
      const fetchedNotes = await response.json();
      setNotes(fetchedNotes.notes || []);
    } catch (err: any) {
      console.error("Error loading notes:", err);
      toast.error(err.message || "Failed to load notes");
      setNotes([]);
    } finally {
      setIsLoadingNotes(false);
    }
  }, [selectedCategory, user]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      window.location.href = "/";
    } catch (error: any) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    }
  };

  const handleSaveNote = async () => {
    if (!user) {
      toast.error("You must be logged in to save notes");
      return;
    }

    if (!selectedCategory) {
      toast.error("Please select a category first");
      return;
    }

    if (noteContent.length < 300 || noteContent.length > 10000) {
      toast.error("Note must be between 300 and 10000 characters");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: noteContent,
          category_id: selectedCategory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save note");
      }

      toast.success("Note saved successfully");
      setNoteContent("");
      loadNotes();
    } catch (err: any) {
      console.error("Error saving note:", err);
      toast.error(err.message || "Failed to save note. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen min-w-screen flex flex-col bg-background">
      {/* Top Bar */}
      <div className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="h-full flex items-center justify-end space-x-4 px-4">
          <p className="text-sm text-muted-foreground mr-[20px]">
            {user?.email}
          </p>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      <div className="flex flex-1 h-[calc(100vh-3.5rem)]">
        {/* Left Sidebar */}
        <div className="w-64 border-r h-full">
          <div className="h-full p-4">
            <h2 className="text-lg font-semibold mb-4">Categories</h2>
            <ScrollArea className="h-[calc(100%-2rem)]">
              <div className="space-y-1 pr-4">
                {initialCategories.map((category: Category) => (
                  <Button
                    key={category.id}
                    variant={
                      selectedCategory === category.id ? "secondary" : "ghost"
                    }
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 space-y-4 h-full overflow-auto">
            <div className="rounded-lg border bg-card">
              <div className="p-4">
                <Textarea
                  placeholder="Enter your note here... (300-10000 chars)"
                  className="min-h-[100px] resize-none w-[90%] mx-auto"
                  value={noteContent}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNoteContent(e.target.value)
                  }
                  disabled={isSaving}
                />
                <div className="mt-2 flex justify-center">
                  <Button
                    onClick={handleSaveNote}
                    disabled={isSaving || !selectedCategory}
                  >
                    {isSaving ? "Saving..." : "Save Note"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Notes List / Note Details */}
            <div className="flex-1">
              {selectedNote ? (
                // Note Details View
                <div className="space-y-4">
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedNote(null)}
                    className="mb-4"
                  >
                    ← Back to List
                  </Button>
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-2">
                      Original Note
                    </h3>
                    <p className="whitespace-pre-wrap">
                      {selectedNote.content}
                    </p>
                  </Card>
                  {selectedNote.summary && (
                    <Card className="p-4">
                      <h3 className="text-lg font-semibold mb-2">Summary</h3>
                      <p>{selectedNote.summary}</p>
                    </Card>
                  )}
                  {/* Q&A section will be implemented later when we add Q&A functionality */}
                </div>
              ) : (
                // Notes List View
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">
                    {selectedCategory
                      ? `Notes - ${
                          initialCategories.find(
                            (c: Category) => c.id === selectedCategory
                          )?.name ?? "Selected Category"
                        }`
                      : "Select a category"}
                  </h2>
                  {isLoadingNotes ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                    </div>
                  ) : notes.length > 0 ? (
                    <div className="grid gap-4">
                      {notes.map((note) => (
                        <Card
                          key={note.id}
                          className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                          onClick={() => setSelectedNote(note)}
                        >
                          <p className="text-sm text-muted-foreground">
                            {new Date(note.created_at).toLocaleDateString()}
                          </p>
                          <p className="mt-2 line-clamp-3">{note.content}</p>
                          {note.summary && (
                            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                              {note.summary}
                            </p>
                          )}
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {selectedCategory
                        ? "No notes in this category yet. Create your first note above!"
                        : "Select a category to view notes"}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardReact;
