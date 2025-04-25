/*
 migration file: 20240425085000_add_summary_status.sql
 purpose: add columns to support asynchronous note summarization
 changes:
 - add summary_status column with enum type
 - add summary_error_message column for error tracking
 - make summary column explicitly nullable
 - update existing rows to have a completed status if they have a summary
 */
-- create enum type for summary status
create type summary_status_type as enum ('pending', 'processing', 'completed', 'failed');
-- add new columns to notes table
alter table notes -- make summary explicitly nullable (it was implicitly nullable before)
alter column summary drop not null,
    -- add status column with default pending
add column summary_status summary_status_type not null default 'pending',
    -- add error message column
add column summary_error_message text;
-- update existing notes to have completed status if they already have a summary
update notes
set summary_status = 'completed'
where summary is not null;
-- add comment to explain the columns
comment on column notes.summary_status is 'Status of AI summary generation: pending (waiting to start), processing (in progress), completed (success), or failed';
comment on column notes.summary_error_message is 'Error message if summary generation failed';
-- enable realtime for the notes table
alter publication supabase_realtime
add table notes;