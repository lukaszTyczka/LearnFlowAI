/*
 migration file: 20231127094500_create_tables.sql
 purpose: create tables for categories, notes, qa_sets, and questions with proper constraints and rls policies for learnflowai project.
 notes:
 - categories table is global; no rls enforced.
 - notes table: rls enabled with policies (select, insert, update, delete) restricting access to rows where user_id equals auth.uid().
 - qa_sets and questions tables: rls enabled with policies ensuring access only if the related note belongs to the logged in user.
 */
-- create table: categories
create table if not exists categories (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    description text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
-- create table: notes
create table if not exists notes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null,
    category_id uuid,
    content text not null check (
        char_length(content) between 300 and 10000
    ),
    summary text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint fk_category foreign key (category_id) references categories(id) on delete
    set null,
        constraint fk_user foreign key (user_id) references auth.users(id)
);
-- create table: qa_sets
create table if not exists qa_sets (
    id uuid primary key default gen_random_uuid(),
    note_id uuid not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint fk_note foreign key (note_id) references notes(id) on delete cascade
);
-- create table: questions
create table if not exists questions (
    id uuid primary key default gen_random_uuid(),
    qa_set_id uuid not null,
    question_text text not null,
    answer_text text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint fk_qa_set foreign key (qa_set_id) references qa_sets(id) on delete cascade
);
-- enable row level security (rls) on relevant tables
alter table notes enable row level security;
alter table qa_sets enable row level security;
alter table questions enable row level security;
-- rls policies for notes table
create policy select_notes on notes for
select using (user_id = auth.uid());
create policy insert_notes on notes for
insert with check (user_id = auth.uid());
create policy update_notes on notes for
update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy delete_notes on notes for delete using (user_id = auth.uid());
-- rls policies for qa_sets table
create policy select_qa_sets on qa_sets for
select using (
        exists (
            select 1
            from notes n
            where n.id = qa_sets.note_id
                and n.user_id = auth.uid()
        )
    );
create policy insert_qa_sets on qa_sets for
insert with check (
        exists (
            select 1
            from notes n
            where n.id = qa_sets.note_id
                and n.user_id = auth.uid()
        )
    );
create policy update_qa_sets on qa_sets for
update using (
        exists (
            select 1
            from notes n
            where n.id = qa_sets.note_id
                and n.user_id = auth.uid()
        )
    ) with check (
        exists (
            select 1
            from notes n
            where n.id = qa_sets.note_id
                and n.user_id = auth.uid()
        )
    );
create policy delete_qa_sets on qa_sets for delete using (
    exists (
        select 1
        from notes n
        where n.id = qa_sets.note_id
            and n.user_id = auth.uid()
    )
);
-- rls policies for questions table
create policy select_questions on questions for
select using (
        exists (
            select 1
            from qa_sets qs
                join notes n on qs.note_id = n.id
            where qs.id = questions.qa_set_id
                and n.user_id = auth.uid()
        )
    );
create policy insert_questions on questions for
insert with check (
        exists (
            select 1
            from qa_sets qs
                join notes n on qs.note_id = n.id
            where qs.id = questions.qa_set_id
                and n.user_id = auth.uid()
        )
    );
create policy update_questions on questions for
update using (
        exists (
            select 1
            from qa_sets qs
                join notes n on qs.note_id = n.id
            where qs.id = questions.qa_set_id
                and n.user_id = auth.uid()
        )
    ) with check (
        exists (
            select 1
            from qa_sets qs
                join notes n on qs.note_id = n.id
            where qs.id = questions.qa_set_id
                and n.user_id = auth.uid()
        )
    );
create policy delete_questions on questions for delete using (
    exists (
        select 1
        from qa_sets qs
            join notes n on qs.note_id = n.id
        where qs.id = questions.qa_set_id
            and n.user_id = auth.uid()
    )
);