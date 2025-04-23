import React from "react";
import { Card } from "../../ui/card";
import type { Tables } from "../../../db/database.types";

type Note = Tables<"notes">;

interface DashboardNotesListProps {
  notes: Note[];
  categories: Tables<"categories">[];
  selectedCategoryId: string | null;
  isLoading: boolean;
  isUserLoggedIn: boolean;
  onNoteSelect: (note: Note) => void;
}

const DashboardNotesList: React.FC<DashboardNotesListProps> = ({
  notes,
  categories,
  selectedCategoryId,
  isLoading,
  isUserLoggedIn,
  onNoteSelect,
}) => {
  const selectedCategoryName = selectedCategoryId
    ? categories.find((c) => c.id === selectedCategoryId)?.name
    : null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        {selectedCategoryId
          ? `Notes - ${selectedCategoryName ?? "Selected Category"}`
          : "Select a category"}
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
