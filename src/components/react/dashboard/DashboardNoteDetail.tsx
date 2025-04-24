import React from "react";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import type { Tables } from "../../../db/database.types";

type Note = Tables<"notes">;

interface DashboardNoteDetailProps {
  note: Note;
  onBack: () => void;
}

const DashboardNoteDetail: React.FC<DashboardNoteDetailProps> = ({
  note,
  onBack,
}) => {
  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        ← Back to List
      </Button>
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Original Note</h3>
        <p className="whitespace-pre-wrap">{note.content}</p>
      </Card>
      {note.summary && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Summary</h3>
          <p>{note.summary}</p>
        </Card>
      )}
    </div>
  );
};

export default DashboardNoteDetail;
