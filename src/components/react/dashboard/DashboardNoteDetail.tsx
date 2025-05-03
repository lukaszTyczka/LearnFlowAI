import React from "react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Loader2, AlertCircle, RefreshCcw, ArrowLeft, Trash2, Brain } from "lucide-react";
import { toast } from "sonner";
import type { Note } from "@/components/hooks/useNotes";

interface DashboardNoteDetailProps {
  note: Note;
  onBack: () => void;
  onNoteDelete: (noteId: string) => void;
  onGenerateQA: (noteId: string) => void;
}

const SummarySection: React.FC<{ note: Note }> = ({ note }) => {
  const handleRetry = async () => {
    try {
      const response = await fetch(`/api/ai/summarize/${note.id}`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to retry summarization");
      }

      toast.success("Retrying summary generation...");
    } catch {
      toast.error("Failed to retry summary generation. Please try again.");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-lg font-semibold">Summary</CardTitle>
        {note.summary_status === "failed" && (
          <Button variant="ghost" size="sm" onClick={handleRetry} className="h-8 px-2">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {(note.summary_status === "pending" || note.summary_status === "processing") && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{note.summary_status === "pending" ? "Pending Summary..." : "Generating Summary..."}</span>
          </div>
        )}
        {note.summary_status === "failed" && (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>Failed: {note.summary_error_message || "Unknown error"}</span>
          </div>
        )}
        {note.summary_status === "completed" && note.summary && (
          <p className="whitespace-pre-wrap text-sm">{note.summary}</p>
        )}
        {note.summary_status === "completed" && !note.summary && (
          <p className="text-sm text-muted-foreground">Summary generated but content is empty.</p>
        )}
      </CardContent>
    </Card>
  );
};

const QASection: React.FC<{ note: Note; onGenerateQA: (noteId: string) => void }> = ({ note, onGenerateQA }) => {
  const handleGenerateQA = () => {
    onGenerateQA(note.id);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-lg font-semibold">Questions & Answers</CardTitle>
        {(note.qa_status === "idle" || note.qa_status === "failed") && (
          <Button variant="ghost" size="sm" onClick={handleGenerateQA} className="h-8 px-2">
            <Brain className="h-4 w-4 mr-2" />
            {note.qa_status === "failed" ? "Retry" : "Generate Q&A"}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {note.qa_status === "processing" && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Generating Questions & Answers...</span>
          </div>
        )}
        {note.qa_status === "failed" && (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>Failed: {note.qa_error_message || "Unknown error"}</span>
          </div>
        )}
        {note.qa_status === "completed" && note.qa_sets?.[0]?.questions && (
          <div className="space-y-6">
            {note.qa_sets[0].questions.map((question, index) => (
              <div key={question.id} className="space-y-2">
                <p className="font-medium">
                  {index + 1}. {question.question_text}
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {["A", "B", "C", "D"].map((option) => {
                    const optionText = question[`option_${option.toLowerCase()}` as keyof typeof question];
                    const isCorrect = question.correct_option === option;

                    return (
                      <div
                        key={option}
                        className={`rounded-md border p-3 ${
                          isCorrect ? "border-green-500 bg-green-50 dark:bg-green-900/10" : "border-border"
                        }`}
                      >
                        <span className="font-medium">{option}.</span> {optionText}
                        {isCorrect && (
                          <span className="ml-2 text-sm text-green-600 dark:text-green-400">(Correct)</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        {note.qa_status === "completed" && !note.qa_sets?.[0]?.questions && (
          <p className="text-sm text-muted-foreground">No questions generated.</p>
        )}
        {note.qa_status === "idle" && (
          <p className="text-sm text-muted-foreground">Click the button above to generate questions.</p>
        )}
      </CardContent>
    </Card>
  );
};

const DashboardNoteDetail: React.FC<DashboardNoteDetailProps> = ({ note, onBack, onNoteDelete, onGenerateQA }) => {
  const handleDeleteClick = () => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      onNoteDelete(note.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={onBack} className="self-start">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
        <Button variant="outline" onClick={handleDeleteClick} className="self-start" aria-label="Delete note">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Note
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Original Note</CardTitle>
          <CardDescription>{new Date(note.created_at).toLocaleString()}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm">{note.content}</p>
        </CardContent>
      </Card>
      <SummarySection note={note} />
      <QASection note={note} onGenerateQA={onGenerateQA} />
    </div>
  );
};

export default DashboardNoteDetail;
