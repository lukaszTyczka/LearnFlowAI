import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { Card } from "./ui/card";
import categoriesService, { type Category } from "../services/category.service";
import authService from "../services/auth.service";

interface Note {
  id: string;
  content: string;
  summary: string;
  category: string;
  qa: Array<{
    question: string;
    answers: string[];
    correctAnswer: number;
  }>;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedCategories = await categoriesService.getCategories();
      setCategories(fetchedCategories);
    } catch (err) {
      setError("Nie udało się załadować kategorii");
      console.error("Error loading categories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      window.location.href = "/login";
    } catch (error: any) {
      console.error("Logout failed:", error);
    }
  };

  const handleSaveNote = async () => {
    if (noteContent.length < 300 || noteContent.length > 10000) {
      alert("Note must be between 300 and 10000 characters.");
      return;
    }
    // TODO: Implement note saving logic with AI processing
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={loadCategories}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-screen flex flex-col bg-background">
      {/* Top Bar */}
      <div className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="h-full flex items-center justify-end space-x-4 px-4">
          <p className="text-sm text-muted-foreground mr-[20px]">
            {user?.email}
          </p>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      <div className="flex flex-1 h-[calc(100vh-3.5rem)]">
        {/* Left Sidebar */}
        <div className="w-64 border-r h-full">
          <div className="h-full p-4">
            <h2 className="text-lg font-semibold mb-4">Categories</h2>
            <ScrollArea className="h-[calc(100%-2rem)]">
              <div className="space-y-1 pr-4">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={
                      selectedCategory === category.id ? "secondary" : "ghost"
                    }
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 space-y-4 h-full overflow-auto">
            <div className="rounded-lg border bg-card">
              <div className="p-4">
                <Textarea
                  placeholder="Enter your note here..."
                  className="min-h-[100px] resize-none w-[90%] mx-auto"
                  value={noteContent}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNoteContent(e.target.value)
                  }
                />
                <div className="mt-2 flex justify-center">
                  <Button onClick={handleSaveNote}>Save Note</Button>
                </div>
              </div>
            </div>

            {/* Notes List / Note Details */}
            <div className="flex-1">
              {selectedNote ? (
                // Note Details View
                <div className="space-y-4">
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedNote(null)}
                    className="mb-4"
                  >
                    ← Back to List
                  </Button>
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-2">
                      Original Note
                    </h3>
                    <p className="whitespace-pre-wrap">
                      {selectedNote.content}
                    </p>
                  </Card>
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-2">Summary</h3>
                    <p>{selectedNote.summary}</p>
                  </Card>
                  <Card className="p-4">
                    <h3 className="text-lg font-semibold mb-2">
                      Questions and Answers
                    </h3>
                    <div className="space-y-4">
                      {selectedNote.qa.map((qa, index) => (
                        <div key={index} className="space-y-2">
                          <p className="font-medium">{qa.question}</p>
                          <div className="pl-4 space-y-1">
                            {qa.answers.map((answer, ansIndex) => (
                              <div
                                key={ansIndex}
                                className={`p-2 rounded ${
                                  ansIndex === qa.correctAnswer
                                    ? "bg-green-100 dark:bg-green-900/20"
                                    : "bg-gray-100 dark:bg-gray-800"
                                }`}
                              >
                                {answer}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              ) : (
                // Notes List View
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">
                    {selectedCategory
                      ? `Notes - ${
                          categories.find((c) => c.id === selectedCategory)
                            ?.name
                        }`
                      : "All Notes"}
                  </h2>
                  {/* TODO: Implement notes list */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
