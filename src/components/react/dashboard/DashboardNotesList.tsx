import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "../../ui/card";
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
}) => {
  const selectedCategoryName = selectedCategoryId ? categories.find((c) => c.id === selectedCategoryId)?.name : null;

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
                className="flex flex-col cursor-pointer border bg-card hover:shadow-md transition-shadow duration-150"
                onClick={() => onNoteSelect(note)}
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onNoteSelect(note)}
              >
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardDescription>{new Date(note.created_at).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow pb-3 px-4">
                  <p className="line-clamp-4 text-sm text-card-foreground">{note.content}</p>
                </CardContent>
                <CardFooter className="pb-3 px-4">
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
