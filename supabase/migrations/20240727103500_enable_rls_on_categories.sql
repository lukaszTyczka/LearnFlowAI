/*
 migration file: 20240727103500_enable_rls_on_categories.sql
 purpose: enable row level security (rls) on the categories table and define read-only access policy for authenticated users.
 affected tables: categories
 notes:
 - enables rls for the categories table.
 - adds a policy allowing any authenticated user read access (select).
 - anonymous users will not have any access.
 - insert, update, delete operations on categories should be handled differently (e.g., by admin role or service_role key if needed in the future).
 */
-- enable row level security (rls) on the categories table
-- this step is required before defining any policies.
-- previously, this table had rls disabled.
alter table categories enable row level security;
comment on table categories is 'stores user-defined categories for organizing notes. rls enabled, read-only access for authenticated users.';
-- rls policy for categories table (authenticated users - read only)
-- policy: allow authenticated users to select all categories
create policy select_categories_authenticated on categories for
select to authenticated using (true);
comment on policy select_categories_authenticated on categories is 'allows authenticated users to view all categories.';
-- no insert, update, or delete policies are defined for authenticated users, making the table effectively read-only for them.