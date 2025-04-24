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
  const isProcessing = isSaving;

  const isButtonEnabled =
    !isProcessing &&
    hasCategorySelected &&
    isUserLoggedIn &&
    noteContent.length >= 300 &&
    noteContent.length <= 10000;

  const handleSave = () => {
    onSave();
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
            {isSaving ? "Saving & Summarizing..." : "Save Note"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardNoteEditor;
