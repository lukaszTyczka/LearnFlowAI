-- Seed initial categories
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