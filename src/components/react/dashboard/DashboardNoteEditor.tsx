import React, { useState } from "react";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";

interface DashboardNoteEditorProps {
  noteContent: string;
  isSaving: boolean;
  isUserLoggedIn: boolean;
  hasCategorySelected: boolean;
  categoryId?: string;
  onContentChange: (content: string) => void;
  onSave: (noteId?: string) => void;
}

const DashboardNoteEditor: React.FC<DashboardNoteEditorProps> = ({
  noteContent,
  isSaving,
  isUserLoggedIn,
  hasCategorySelected,
  categoryId,
  onContentChange,
  onSave,
}) => {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const isProcessing = isSaving || isSummarizing;

  const isButtonEnabled =
    !isProcessing &&
    hasCategorySelected &&
    isUserLoggedIn &&
    noteContent.length >= 300 &&
    noteContent.length <= 10000;

  const handleSave = async () => {
    try {
      setIsSummarizing(true);

      // Call the summarize endpoint
      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: noteContent,
          maxLength: 500, // Reasonable length for a summary
          categoryId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to summarize note");
      }

      const result = await response.json();

      // Pass the noteId from the summarize endpoint to the parent
      onSave(result.noteId);
    } catch (error) {
      console.error("Error saving note with summary:", error);
      // Still call onSave to allow normal note saving even if summarization fails
      onSave();
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-4">
        <Textarea
          placeholder={
            isUserLoggedIn
              ? "Enter your note here... (300-10000 chars)"
              : "Please log in to create notes"
          }
          className="min-h-[100px] resize-none w-[90%] mx-auto"
          value={noteContent}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            onContentChange(e.target.value)
          }
          disabled={isProcessing || !isUserLoggedIn}
        />
        <div className="text-sm text-gray-500 text-right w-[90%] mx-auto mt-1">
          300/{noteContent.length}/10000
        </div>
        <div className="mt-2 flex justify-center">
          <Button
            onClick={handleSave}
            disabled={!isButtonEnabled}
            className={
              isButtonEnabled
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-300 text-gray-500"
            }
          >
            {isSummarizing
              ? "Summarizing..."
              : isSaving
              ? "Saving..."
              : "Save Note"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardNoteEditor;
