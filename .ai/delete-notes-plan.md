# Plan API Astro: Usuwanie Notatek

Ten dokument opisuje punkt końcowy API do usuwania notatek w backendzie Astro.

**Odniesienie:** @prd.md (FR-030, US-014)

## Punkt końcowy (Endpoint)

### 1. Usuń Notatkę po ID

- **Ścieżka:** `DELETE /api/notes/[id]`
- **Opis:** Usuwa konkretną notatkę należącą do zalogowanego użytkownika.
- **Parametry URL:** `id` (UUID notatki).
- **Logika handlera (`src/pages/api/notes/[id].ts` - DELETE):**
  1.  Zweryfikuj uwierzytelnienie użytkownika (sprawdź `Astro.locals.user`). Zwróć 401 (Unauthorized), jeśli nie jest zalogowany.
  2.  Wyodrębnij `id` z `Astro.params`. Sprawdź, czy `id` jest poprawnym formatem UUID. Jeśli nie, zwróć 400 (Bad Request).
  3.  Wywołaj klienta serwerowego Supabase, aby usunąć notatkę o podanym `id`.
      - **Kluczowe:** RLS (Row Level Security) skonfigurowane na tabeli `notes` powinno automatycznie zapewnić, że użytkownik może usunąć tylko _własną_ notatkę. Zapytanie `DELETE` zakończy się niepowodzeniem lub nie usunie żadnych wierszy, jeśli użytkownik nie jest właścicielem notatki o danym ID.
      - **Uwaga:** Jeżeli brakuje zaimplementuj kaskadowego usuwania w bazie danych dla powiązanych danych (np. podsumowania, zestawy Q&A, oceny) lub obsługę ich usuwania ręcznie w logice handlera, jeśli to konieczne. Początkowo zakładamy, że RLS wystarczy do autoryzacji, a baza danych (lub logika aplikacji w przyszłości) zadba o spójność danych.
      ```typescript
      // Przykładowe zapytanie Supabase
      const { error, count } = await locals.supabase.from("notes").delete().eq("id", id); // RLS zajmie się sprawdzeniem user_id
      ```
  4.  Obsłuż potencjalne błędy bazy danych (np. `error` nie jest null). Zwróć 500 (Internal Server Error).
  5.  Sprawdź `count` (lub równoważny wskaźnik w zależności od implementacji klienta Supabase) - jeśli wynosi 0, oznacza to, że notatka o podanym ID nie została znaleziona lub użytkownik nie miał uprawnień do jej usunięcia (ze względu na RLS). W takim przypadku zwróć 404 (Not Found).
  6.  Jeśli usunięcie powiodło się (`count > 0`), zwróć status 204 (No Content).
- **Uwierzytelnianie:** Wymaga aktywnej sesji.
- **Odpowiedzi:**
  - `204 No Content`: Notatka pomyślnie usunięta.
  - `401 Unauthorized`: Użytkownik nie jest zalogowany.
  - `400 Bad Request`: Nieprawidłowy format ID notatki.
  - `404 Not Found`: Notatka o podanym ID nie istnieje lub użytkownik nie ma do niej dostępu.
  - `500 Internal Server Error`: Błąd podczas operacji na bazie danych.
