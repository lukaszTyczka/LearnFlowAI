import React from "react";
import { Button } from "../../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import type { Tables } from "../../../db/database.types";
import { Loader2, AlertCircle, RefreshCcw, ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Note = Tables<"notes"> & {
  summary_status: "pending" | "processing" | "completed" | "failed";
  summary_error_message?: string | null;
};

interface DashboardNoteDetailProps {
  note: Note;
  onBack: () => void;
  onNoteDelete: (noteId: string) => void;
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

const DashboardNoteDetail: React.FC<DashboardNoteDetailProps> = ({ note, onBack, onNoteDelete }) => {
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
    </div>
  );
};

export default DashboardNoteDetail;
