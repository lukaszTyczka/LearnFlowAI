-- Migration: Add key_points column to notes table
-- Description: Adds a text array column to store key points generated during summarization.
-- Affected tables: notes
-- add the key_points column to the notes table
-- this column will store an array of text representing key points from the summary
alter table public.notes
add column key_points text [];
-- add a comment to the new column for clarity
comment on column public.notes.key_points is 'stores key points generated from the note content summary.';