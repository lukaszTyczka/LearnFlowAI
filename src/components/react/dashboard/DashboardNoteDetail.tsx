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
  // Parse key points from the summary if they exist
  const summaryData = note.summary ? JSON.parse(note.summary) : null;
  const hasStructuredSummary = summaryData && typeof summaryData === "object";

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
          {hasStructuredSummary ? (
            <>
              <p className="mb-4">{summaryData.summary}</p>
              {summaryData.keyPoints && summaryData.keyPoints.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold mb-2">Key Points</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {summaryData.keyPoints.map(
                      (point: string, index: number) => (
                        <li key={index} className="text-sm text-gray-700">
                          {point}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
              {summaryData.wordCount && (
                <p className="text-sm text-gray-500 mt-4">
                  Word count: {summaryData.wordCount}
                </p>
              )}
            </>
          ) : (
            <p>{note.summary}</p>
          )}
        </Card>
      )}
    </div>
  );
};

export default DashboardNoteDetail;
