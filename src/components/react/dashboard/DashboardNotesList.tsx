import React from "react";
import { Card } from "../../ui/card";
import type { Tables } from "../../../db/database.types";
import { Loader2, AlertCircle } from "lucide-react";

type Note = Tables<"notes"> & {
  summary_status: "pending" | "processing" | "completed" | "failed";
  summary_error_message?: string | null;
};

interface DashboardNotesListProps {
  notes: Note[];
  categories: Tables<"categories">[];
  selectedCategoryId: string | null;
  isLoading: boolean;
  isUserLoggedIn: boolean;
  onNoteSelect: (note: Note) => void;
}

const SummaryStatus: React.FC<{ note: Note }> = ({ note }) => {
  if (note.summary_status === "pending" || note.summary_status === "processing") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{note.summary_status === "pending" ? "Waiting to generate summary..." : "Generating summary..."}</span>
      </div>
    );
  }

  if (note.summary_status === "failed") {
    return (
      <div
        className="flex items-center gap-2 text-sm text-destructive"
        title={note.summary_error_message || "Unknown error"}
      >
        <AlertCircle className="h-4 w-4" />
        <span>Failed to generate summary</span>
      </div>
    );
  }

  if (note.summary) {
    return <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{note.summary}</p>;
  }

  return null;
};

const DashboardNotesList: React.FC<DashboardNotesListProps> = ({
  notes,
  categories,
  selectedCategoryId,
  isLoading,
  isUserLoggedIn,
  onNoteSelect,
}) => {
  const selectedCategoryName = selectedCategoryId ? categories.find((c) => c.id === selectedCategoryId)?.name : null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        {selectedCategoryId ? `Notes - ${selectedCategoryName ?? "Selected Category"}` : "Select a category"}
      </h2>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : notes.length > 0 ? (
        <div className="grid gap-4">
          {notes.map((note) => (
            <Card
              key={note.id}
              className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => onNoteSelect(note)}
            >
              <p className="text-sm text-muted-foreground">{new Date(note.created_at).toLocaleDateString()}</p>
              <p className="mt-2 line-clamp-3">{note.content}</p>
              <div className="mt-2">
                <SummaryStatus note={note} />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          {!isUserLoggedIn
            ? "Please log in to view notes."
            : selectedCategoryId
              ? "No notes in this category yet. Create one above!"
              : "Select a category to view notes"}
        </div>
      )}
    </div>
  );
};

export default DashboardNotesList;
