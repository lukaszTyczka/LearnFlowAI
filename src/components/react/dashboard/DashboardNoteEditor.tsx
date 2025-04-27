import React from "react";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { Card, CardContent } from "../../ui/card";
import { Loader2 } from "lucide-react";

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
  const minChars = 300;
  const maxChars = 10000;

  const isButtonEnabled =
    !isProcessing &&
    hasCategorySelected &&
    isUserLoggedIn &&
    noteContent.length >= minChars &&
    noteContent.length <= maxChars;

  const handleSave = () => {
    onSave();
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <Textarea
          placeholder={
            !isUserLoggedIn
              ? "Please log in to create notes"
              : !hasCategorySelected
                ? "Please select a category to create notes"
                : `Enter your note here... (${minChars}-${maxChars} chars)`
          }
          className="min-h-[150px] resize-y w-full"
          value={noteContent}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onContentChange(e.target.value)}
          disabled={isProcessing || !isUserLoggedIn || !hasCategorySelected}
          aria-label="Note Content Input"
        />
        <div
          className={`text-sm text-right ${noteContent.length > maxChars || (noteContent.length > 0 && noteContent.length < minChars) ? "text-destructive" : "text-muted-foreground"}`}
        >
          {noteContent.length} / {maxChars}
        </div>
        <div className="flex justify-center">
          <Button onClick={handleSave} disabled={!isButtonEnabled}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save Note & Get Summary"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardNoteEditor;
