/*
 migration file: 20240321143000_seed_categories.sql
 purpose: seed the categories table with initial category values
 notes:
 - inserts basic categories for note organization
 - checks for existing categories to prevent duplicates
 */
-- insert categories if they don't exist
insert into categories (name, description)
values (
        'Others',
        'General category for miscellaneous notes that don''t fit other categories'
    ),
    (
        'University',
        'Academic-related content and study materials'
    ),
    (
        'Programming',
        'Software development, coding, and programming-related topics'
    ),
    (
        'Hardware',
        'Computer hardware, electronics, and physical computing components'
    ) on conflict (name) do nothing;