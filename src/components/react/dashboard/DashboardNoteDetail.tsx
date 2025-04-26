import React from "react";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import type { Tables } from "../../../db/database.types";
import { Loader2, AlertCircle, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

type Note = Tables<"notes"> & {
  summary_status: "pending" | "processing" | "completed" | "failed";
  summary_error_message?: string | null;
};

interface DashboardNoteDetailProps {
  note: Note;
  onBack: () => void;
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
    } catch (error) {
      toast.error("Failed to retry summary generation. Please try again.");
    }
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold mb-2">Summary</h3>
        {note.summary_status === "failed" && (
          <Button variant="ghost" size="sm" onClick={handleRetry} className="h-8 px-2">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
      </div>

      {(note.summary_status === "pending" || note.summary_status === "processing") && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{note.summary_status === "pending" ? "Waiting to generate summary..." : "Generating summary..."}</span>
        </div>
      )}

      {note.summary_status === "failed" && (
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>Failed to generate summary: {note.summary_error_message || "Unknown error"}</span>
        </div>
      )}

      {note.summary_status === "completed" && note.summary && <p>{note.summary}</p>}
    </Card>
  );
};

const DashboardNoteDetail: React.FC<DashboardNoteDetailProps> = ({ note, onBack }) => {
  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        ← Back to List
      </Button>
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Original Note</h3>
        <p className="whitespace-pre-wrap">{note.content}</p>
      </Card>
      <SummarySection note={note} />
    </div>
  );
};

export default DashboardNoteDetail;
