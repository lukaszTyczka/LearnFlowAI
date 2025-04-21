# Plan API Astro: Kategorie

Ten dokument opisuje punkty końcowe API do pobierania informacji o kategoriach w backendzie Astro.

**Odniesienie:** @astro-api-guidelines.mdc

## Punkty końcowe (Endpoints)

### 1. Pobierz Wszystkie Kategorie

- **Ścieżka:** `GET /api/categories`
- **Opis:** Pobiera listę wszystkich dostępnych kategorii.
- **Parametry zapytania (Query Parameters):** Brak.
- **Logika handlera (`src/pages/api/categories/index.ts`):**
  1.  Wywołaj klienta serwerowego Supabase (dostępnego przez `Astro.locals.supabase`), aby pobrać wszystkie rekordy z tabeli `categories`.
      ```typescript
      const { data: categories, error } = await locals.supabase
        .from("categories")
        .select("id, name, description"); // Wybierz żądane pola
      ```
  2.  Obsłuż potencjalne błędy podczas pobierania.
  3.  Zwróć listę kategorii (np. status 200) lub odpowiedź błędu.
- **Uwierzytelnianie:** Zakłada się publiczny dostęp (lub wymaga podstawowego uwierzytelnienia użytkownika, jeśli kategorie mają być widoczne tylko dla zalogowanych użytkowników - sprawdź middleware). Na podstawie `@db-plan.md`, RLS może być wyłączone lub zezwalać tylko na odczyt, czyniąc dostęp publicznym.

### 2. Pobierz Kategorię po ID

- **Ścieżka:** `GET /api/categories/[id]`
- **Opis:** Pobiera szczegóły konkretnej kategorii na podstawie jej ID.
- **Parametry URL:** `id` (UUID kategorii).
- **Logika handlera (`src/pages/api/categories/[id].ts`):**
  1.  Wyodrębnij `id` z `Astro.params`.
  2.  Zwaliduj format `id` (opcjonalne, ale zalecane).
  3.  Wywołaj klienta serwerowego Supabase, aby pobrać konkretną kategorię.
      ```typescript
      const { data: category, error } = await locals.supabase
        .from("categories")
        .select("id, name, description")
        .eq("id", id)
        .single();
      ```
  4.  Obsłuż błędy (w tym nieznalezienie kategorii - sprawdź, czy `category` jest null).
  5.  Zwróć szczegóły kategorii (status 200), Nie znaleziono (status 404) lub inną odpowiedź błędu.
- **Uwierzytelnianie:** Zakłada się publiczny dostęp (podobne uzasadnienie jak dla Pobierz Wszystkie Kategorie).
