import React, { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import { $user } from "../../stores/authStore";
import type { Tables } from "../../db/database.types";

// Import custom hooks
import { useCategories } from "../hooks/useCategories";
import { useNotes, type Note } from "../hooks/useNotes";

// Import the extracted components
import DashboardSidebar from "./dashboard/DashboardSidebar";
import DashboardNoteEditor from "./dashboard/DashboardNoteEditor";
import DashboardNotesList from "./dashboard/DashboardNotesList";
import DashboardNoteDetail from "./dashboard/DashboardNoteDetail";

// Keep Toaster for potential future notifications (e.g., save success/error)
import { Toaster } from "../ui/sonner";

type Category = Tables<"categories">;

interface DashboardProps {
  initialCategories?: Category[];
}

const DashboardReact: React.FC<DashboardProps> = ({ initialCategories = [] }) => {
  const user = useStore($user);
  const [hasMounted, setHasMounted] = useState(false);

  // Use custom hooks to manage categories and notes
  const {
    categories,
    isLoading: isLoadingCategories,
    selectedCategoryId,
    setSelectedCategoryId,
  } = useCategories(initialCategories);

  const {
    notes,
    isLoading: isLoadingNotes,
    selectedNote,
    setSelectedNote,
    noteContent,
    setNoteContent,
    isSaving,
    loadNotes,
    saveNote,
    deleteNote,
    generateQA,
  } = useNotes(user);

  // Load notes when category changes
  useEffect(() => {
    loadNotes(selectedCategoryId);
  }, [selectedCategoryId, loadNotes]);

  // Set hasMounted to true after initial client render
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleSaveNote = async () => {
    const success = await saveNote(selectedCategoryId);
    if (success) {
      loadNotes(selectedCategoryId);
      // Consider adding a success toast here
    } else {
      // Consider adding an error toast here
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedNote(null);
  };

  const handleNoteContentChange = (content: string) => {
    setNoteContent(content);
  };

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
  };

  const handleBackToNotesList = () => {
    setSelectedNote(null);
  };

  // Define the delete handler
  const handleNoteDelete = async (noteId: string) => {
    await deleteNote(noteId);
  };

  // Add handler for Q&A generation
  const handleGenerateQA = async (noteId: string) => {
    await generateQA(noteId);
  };

  return (
    // Removed outer div and DashboardTopBar.
    // BaseLayout provides the header and flex context.
    // This div now represents the main content area next to the sidebar.
    <div className="flex flex-1 border-t">
      {/* Left Sidebar */}
      <DashboardSidebar
        categories={categories}
        isLoading={isLoadingCategories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={handleCategorySelect}
      />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="p-4 md:p-6 lg:p-8 space-y-6 flex-grow">
          <DashboardNoteEditor
            noteContent={noteContent}
            isSaving={isSaving}
            isUserLoggedIn={hasMounted && !!user}
            hasCategorySelected={!!selectedCategoryId}
            onContentChange={handleNoteContentChange}
            onSave={handleSaveNote}
          />

          <div className="flex-1">
            {selectedNote ? (
              <DashboardNoteDetail
                note={selectedNote}
                onBack={handleBackToNotesList}
                onNoteDelete={handleNoteDelete}
                onGenerateQA={handleGenerateQA}
              />
            ) : (
              <DashboardNotesList
                notes={notes}
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                isLoading={isLoadingNotes}
                isUserLoggedIn={hasMounted && !!user}
                onNoteSelect={handleNoteSelect}
                onNoteDelete={handleNoteDelete}
              />
            )}
          </div>
        </div>
      </div>
      {/* Toaster for notifications */}
      <Toaster />
    </div>
  );
};

export default DashboardReact;
