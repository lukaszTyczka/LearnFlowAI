-- Add Q&A status tracking to notes table
ALTER TABLE notes
ADD COLUMN IF NOT EXISTS qa_status TEXT NOT NULL DEFAULT 'idle',
    ADD COLUMN IF NOT EXISTS qa_error_message TEXT,
    ADD CONSTRAINT qa_status_check CHECK (
        qa_status IN ('idle', 'processing', 'completed', 'failed')
    );
-- Modify questions table to support ABCD format
-- First, drop the existing answer_text column
ALTER TABLE questions DROP COLUMN IF EXISTS answer_text;
-- Then add the new columns for ABCD format
ALTER TABLE questions
ADD COLUMN IF NOT EXISTS option_a TEXT,
    ADD COLUMN IF NOT EXISTS option_b TEXT,
    ADD COLUMN IF NOT EXISTS option_c TEXT,
    ADD COLUMN IF NOT EXISTS option_d TEXT,
    ADD COLUMN IF NOT EXISTS correct_option CHAR(1);
-- Add NOT NULL constraints after adding the columns to handle existing data
ALTER TABLE questions
ALTER COLUMN option_a
SET NOT NULL,
    ALTER COLUMN option_b
SET NOT NULL,
    ALTER COLUMN option_c
SET NOT NULL,
    ALTER COLUMN option_d
SET NOT NULL,
    ALTER COLUMN correct_option
SET NOT NULL;
-- Add the check constraint for correct_option
ALTER TABLE questions
ADD CONSTRAINT correct_option_check CHECK (correct_option IN ('A', 'B', 'C', 'D'));
-- Enable realtime for qa_status updates (if not already enabled)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'notes'
) THEN ALTER PUBLICATION supabase_realtime
ADD TABLE notes;
END IF;
END $$;
-- Add helpful comments
COMMENT ON COLUMN notes.qa_status IS 'Status of Q&A generation process: idle, processing, completed, or failed';
COMMENT ON COLUMN notes.qa_error_message IS 'Error message if Q&A generation fails';
COMMENT ON COLUMN questions.option_a IS 'First option for multiple choice question';
COMMENT ON COLUMN questions.option_b IS 'Second option for multiple choice question';
COMMENT ON COLUMN questions.option_c IS 'Third option for multiple choice question';
COMMENT ON COLUMN questions.option_d IS 'Fourth option for multiple choice question';
COMMENT ON COLUMN questions.correct_option IS 'Correct option (A, B, C, or D) for the question';