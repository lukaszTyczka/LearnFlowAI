import React, { useEffect } from "react";
import { useStore } from "@nanostores/react";
import { $user, logout } from "../../stores/authStore";
import type { Tables } from "../../db/database.types";

// Import custom hooks
import { useCategories } from "../hooks/useCategories";
import { useNotes } from "../hooks/useNotes";

// Import the extracted components
import DashboardTopBar from "./dashboard/DashboardTopBar";
import DashboardSidebar from "./dashboard/DashboardSidebar";
import DashboardNoteEditor from "./dashboard/DashboardNoteEditor";
import DashboardNotesList from "./dashboard/DashboardNotesList";
import DashboardNoteDetail from "./dashboard/DashboardNoteDetail";

type Category = Tables<"categories">;

interface DashboardProps {
  initialCategories?: Category[];
}

const DashboardReact: React.FC<DashboardProps> = ({
  initialCategories = [],
}) => {
  const user = useStore($user);

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
  } = useNotes(user);

  // Load notes when category changes
  useEffect(() => {
    loadNotes(selectedCategoryId);
  }, [selectedCategoryId, loadNotes]);

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      window.location.href = "/";
    }
  };

  const handleSaveNote = async () => {
    const success = await saveNote(selectedCategoryId);
    if (success) {
      loadNotes(selectedCategoryId);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedNote(null);
  };

  const handleNoteContentChange = (content: string) => {
    setNoteContent(content);
  };

  const handleNoteSelect = (note: Tables<"notes">) => {
    setSelectedNote(note);
  };

  const handleBackToNotesList = () => {
    setSelectedNote(null);
  };

  return (
    <div className="min-h-screen min-w-screen flex flex-col bg-background">
      {/* Top Bar */}
      <DashboardTopBar userEmail={user?.email} onLogout={handleLogout} />

      <div className="flex flex-1 h-[calc(100vh-3.5rem)]">
        {/* Left Sidebar */}
        <DashboardSidebar
          categories={categories}
          isLoading={isLoadingCategories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={handleCategorySelect}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 space-y-4 h-full overflow-auto">
            {/* Note Editor */}
            <DashboardNoteEditor
              noteContent={noteContent}
              isSaving={isSaving}
              isUserLoggedIn={!!user}
              hasCategorySelected={!!selectedCategoryId}
              onContentChange={handleNoteContentChange}
              onSave={handleSaveNote}
            />

            {/* Notes List / Note Details */}
            <div className="flex-1">
              {selectedNote ? (
                <DashboardNoteDetail
                  note={selectedNote}
                  onBack={handleBackToNotesList}
                />
              ) : (
                <DashboardNotesList
                  notes={notes}
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  isLoading={isLoadingNotes}
                  isUserLoggedIn={!!user}
                  onNoteSelect={handleNoteSelect}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardReact;
