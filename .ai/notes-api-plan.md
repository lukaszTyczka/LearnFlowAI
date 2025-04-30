# Plan API Astro: Notatki

Ten dokument opisuje punkty końcowe API do zarządzania notatkami w backendzie Astro, używane przez komponenty frontendowe React.

**Odniesienie:** @astro-api-guidelines.mdc, @prd.md (US-006, US-008, FR-030, US-014)

## Punkty końcowe (Endpoints)

### 1. Utwórz Notatkę

- **Ścieżka:** `POST /api/notes`
- **Opis:** Tworzy nową notatkę dla zalogowanego użytkownika.
- **Ciało żądania (Request Body):**
  ```json
  {
    "content": "To jest treść notatki...",
    "categoryId": "opcjonalne-uuid-kategorii" // Opcjonalne
  }
  ```
- **Walidacja:** Użyj schematu Zod (`src/lib/validators/notes.ts`) do walidacji długości treści (300-10000 znaków zgodnie z FR-019) i opcjonalnego formatu `categoryId`.
- **Logika handlera (`src/pages/api/notes/index.ts` - POST):**
  1.  Zweryfikuj uwierzytelnienie użytkownika (sprawdź `Astro.locals.user`). Zwróć 401, jeśli nie jest zalogowany.
  2.  Zwaliduj ciało żądania.
  3.  Wstaw nową notatkę do tabeli `notes` używając klienta serwerowego Supabase, powiązując ją z `locals.user.id` i podanym `categoryId` (jeśli istnieje).
  4.  **Przetwarzanie AI:** **Poza zakresem początkowej refaktoryzacji.** Funkcjonalność generowania podsumowań, kategoryzacji AI i Q&A zostanie dodana w późniejszym etapie. Ten endpoint na razie _tylko_ zapisuje notatkę w bazie danych.
  5.  Obsłuż potencjalne błędy bazy danych.
  6.  Zwróć podstawowe dane utworzonej notatki (np. ID) ze statusem 201.
- **Uwierzytelnianie:** Wymaga aktywnej sesji.

### 2. Pobierz Wszystkie Notatki (dla Użytkownika)

- **Ścieżka:** `GET /api/notes`
- **Opis:** Pobiera listę notatek należących do zalogowanego użytkownika.
- **Parametry zapytania (Query Parameters):**
  - `categoryId` (opcjonalne, UUID): Filtruj notatki według kategorii.
  - `sortBy` (opcjonalne, np. `created_at_desc`): Definiuj sortowanie.
  - `page`, `limit` (opcjonalne): Dla paginacji.
- **Logika handlera (`src/pages/api/notes/index.ts` - GET):**
  1.  Zweryfikuj uwierzytelnienie użytkownika (sprawdź `Astro.locals.user`). Zwróć 401, jeśli nie jest zalogowany.
  2.  Sparsuj i zwaliduj parametry zapytania.
  3.  Zbuduj zapytanie Supabase do wybrania notatek z tabeli `notes`.
      - **Kluczowe:** Zapytanie opiera się na włączonym i poprawnie skonfigurowanym RLS dla tabeli `notes`, automatycznie filtrując przez `user_id = auth.uid()`.
      - Zastosuj filtry (np. `.eq('category_id', categoryId)`, jeśli podano).
      - Zastosuj sortowanie i paginację.
      - Wybierz niezbędne pola (np. `id`, `created_at`, `summary`, `category:categories(name)`).
  4.  Wykonaj zapytanie używając klienta serwerowego Supabase.
  5.  Obsłuż potencjalne błędy.
  6.  Zwróć listę notatek (status 200) lub odpowiedź błędu.
- **Uwierzytelnianie:** Wymaga aktywnej sesji.

### 3. Pobierz Notatkę po ID

- **Ścieżka:** `GET /api/notes/[id]`
- **Opis:** Pobiera szczegóły konkretnej notatki należącej do zalogowanego użytkownika.
- **Parametry URL:** `id` (UUID notatki).
- **Logika handlera (`src/pages/api/notes/[id].ts` - GET):**
  1.  Zweryfikuj uwierzytelnienie użytkownika (sprawdź `Astro.locals.user`). Zwróć 401, jeśli nie jest zalogowany.
  2.  Wyodrębnij `id` z `Astro.params`.
  3.  Wywołaj klienta serwerowego Supabase, aby pobrać konkretną notatkę.
      - Zapytanie powinno wybrać notatkę po `id`.
      - **Kluczowe:** RLS na tabeli `notes` zapewnia, że użytkownik może pobrać tylko _własną_ notatkę o tym ID.
      - Wybierz szczegółowe pola, potencjalnie łącząc powiązane dane, takie jak nazwa kategorii, zestawy Q&A i pytania.
      ```typescript
      // Przykładowy wybór
      const { data: note, error } = await locals.supabase
        .from("notes")
        .select(
          `
          id, content, summary, created_at,
          category:categories(id, name),
          qa_sets(id, questions(id, question_text, answer_text))
        `
        )
        .eq("id", id)
        // RLS obsługuje sprawdzanie user_id automatycznie
        .single();
      ```
  4.  Obsłuż błędy (w tym nieznalezienie notatki - sprawdź, czy `note` jest null, co oznacza, że albo nie istnieje, albo użytkownik jej nie posiada z powodu RLS).
  5.  Zwróć szczegóły notatki (status 200), Nie znaleziono (status 404) lub inną odpowiedź błędu.
- **Uwierzytelnianie:** Wymaga aktywnej sesji.

### 4. Usuń Notatkę po ID

- **Ścieżka:** `DELETE /api/notes/[id]`
- **Opis:** Usuwa konkretną notatkę należącą do zalogowanego użytkownika.
- **Parametry URL:** `id` (UUID notatki).
- **Logika handlera (`src/pages/api/notes/[id].ts` - DELETE):**
  1.  Zweryfikuj uwierzytelnienie użytkownika (sprawdź `Astro.locals.user`). Zwróć 401 (Unauthorized), jeśli nie jest zalogowany.
  2.  Wyodrębnij `id` z `Astro.params`. Sprawdź, czy `id` jest poprawnym formatem UUID. Jeśli nie, zwróć 400 (Bad Request).
  3.  Wywołaj klienta serwerowego Supabase, aby usunąć notatkę o podanym `id`.
      - **Kluczowe:** RLS (Row Level Security) skonfigurowane na tabeli `notes` automatycznie zapewnia, że użytkownik może usunąć tylko _własną_ notatkę. Zapytanie `DELETE` zakończy się niepowodzeniem lub nie usunie żadnych wierszy, jeśli użytkownik nie jest właścicielem notatki o danym ID.
      - **Usuwanie kaskadowe:** Zgodnie z migracją `20240417094500_create_tables.sql`, usunięcie notatki spowoduje kaskadowe usunięcie powiązanych `qa_sets` i `questions` dzięki definicji kluczy obcych z `ON DELETE CASCADE`.
      ```typescript
      // Przykładowe zapytanie Supabase
      const { error, count } = await locals.supabase.from("notes").delete().eq("id", id); // RLS zajmie się sprawdzeniem user_id
      ```
  4.  Obsłuż potencjalne błędy bazy danych (np. `error` nie jest null). Zwróć 500 (Internal Server Error).
  5.  Sprawdź `count` - jeśli wynosi 0, oznacza to, że notatka o podanym ID nie została znaleziona lub użytkownik nie miał uprawnień do jej usunięcia (ze względu na RLS). W takim przypadku zwróć 404 (Not Found).
  6.  Jeśli usunięcie powiodło się (`count > 0`), zwróć status 204 (No Content).
- **Uwierzytelnianie:** Wymaga aktywnej sesji.
- **Odpowiedzi:**
  - `204 No Content`: Notatka pomyślnie usunięta.
  - `401 Unauthorized`: Użytkownik nie jest zalogowany.
  - `400 Bad Request`: Nieprawidłowy format ID notatki.
  - `404 Not Found`: Notatka o podanym ID nie istnieje lub użytkownik nie ma do niej dostępu.
  - `500 Internal Server Error`: Błąd podczas operacji na bazie danych.
