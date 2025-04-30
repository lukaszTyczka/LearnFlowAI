import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "../../ui/card";
import type { Tables } from "../../../db/database.types";
import { Loader2, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "../../ui/button";

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
  onNoteDelete: (noteId: string) => void;
}

const SummaryStatus: React.FC<{ note: Note }> = ({ note }) => {
  let content: React.ReactNode = null;

  if (note.summary_status === "pending" || note.summary_status === "processing") {
    content = (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{note.summary_status === "pending" ? "Pending Summary..." : "Generating Summary..."}</span>
      </div>
    );
  } else if (note.summary_status === "failed") {
    content = (
      <div className="flex items-center gap-2 text-destructive" title={note.summary_error_message || "Unknown error"}>
        <AlertCircle className="h-4 w-4" />
        <span>Summary Failed</span>
      </div>
    );
  } else if (note.summary_status === "completed" && note.summary) {
    content = <p className="line-clamp-2">{note.summary}</p>;
  } else {
    content = <span>Summary not available</span>;
  }

  return <div className="text-sm text-muted-foreground mt-1">{content}</div>;
};

const DashboardNotesList: React.FC<DashboardNotesListProps> = ({
  notes,
  categories,
  selectedCategoryId,
  isLoading,
  isUserLoggedIn,
  onNoteSelect,
  onNoteDelete,
}) => {
  const selectedCategoryName = selectedCategoryId ? categories.find((c) => c.id === selectedCategoryId)?.name : null;

  const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>, noteId: string) => {
    event.stopPropagation();
    if (window.confirm("Are you sure you want to delete this note?")) {
      onNoteDelete(noteId);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        {selectedCategoryId ? `Notes - ${selectedCategoryName ?? "Selected Category"}` : "Select a category"}
      </h2>
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
      {!isLoading &&
        (notes.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {notes.map((note) => (
              <Card
                key={note.id}
                className="flex flex-col border bg-card hover:shadow-md transition-shadow duration-150 relative group"
              >
                <div
                  className="absolute inset-0 cursor-pointer z-0"
                  onClick={() => onNoteSelect(note)}
                  tabIndex={-1}
                  onKeyDown={(e) => e.key === "Enter" && onNoteSelect(note)}
                  aria-hidden="true"
                ></div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 z-10 h-7 w-7 transition-opacity text-muted-foreground hover:text-destructive"
                  onClick={(e) => handleDeleteClick(e, note.id)}
                  aria-label="Delete note"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <CardHeader className="pb-2 pt-4 px-4 cursor-pointer z-10" onClick={() => onNoteSelect(note)}>
                  <CardDescription>{new Date(note.created_at).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow pb-3 px-4 cursor-pointer z-10" onClick={() => onNoteSelect(note)}>
                  <p className="line-clamp-4 text-sm text-card-foreground">{note.content}</p>
                </CardContent>
                <CardFooter className="pb-3 px-4 z-10">
                  <SummaryStatus note={note} />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {!isUserLoggedIn
              ? "Please log in to view notes."
              : selectedCategoryId
                ? "No notes in this category yet. Create one above!"
                : "Select a category from the left to view notes."}
          </div>
        ))}
    </div>
  );
};

export default DashboardNotesList;
