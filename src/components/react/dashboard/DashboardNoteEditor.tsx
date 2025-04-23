import React from "react";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";

interface DashboardNoteEditorProps {
  noteContent: string;
  isSaving: boolean;
  isUserLoggedIn: boolean;
  hasCategorySelected: boolean;
  onContentChange: (content: string) => void;
  onSave: () => void;
}

const DashboardNoteEditor: React.FC<DashboardNoteEditorProps> = ({
  noteContent,
  isSaving,
  isUserLoggedIn,
  hasCategorySelected,
  onContentChange,
  onSave,
}) => {
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
          disabled={isSaving || !isUserLoggedIn}
        />
        <div className="mt-2 flex justify-center">
          <Button
            onClick={onSave}
            disabled={isSaving || !hasCategorySelected || !isUserLoggedIn}
          >
            {isSaving ? "Saving..." : "Save Note"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardNoteEditor;
