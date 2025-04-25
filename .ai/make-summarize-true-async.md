# Plan Wdrożenia Asynchronicznego Podsumowywania Notatek

## Cel

Zmodyfikować proces zapisywania notatek tak, aby podsumowanie generowane przez AI odbywało się asynchronicznie, bez blokowania odpowiedzi dla użytkownika. Zaktualizować interfejs użytkownika, aby odzwierciedlał status generowania podsumowania i automatycznie wyświetlał je po ukończeniu.

## Kroki Implementacji

### 1. Zmiany w Backendzie

#### 1.1. Modyfikacja API Zapisu Notatki (`POST /api/notes`)

- **Plik:** `src/pages/api/notes/index.ts`
- **Zmiany:**
  - Usuń bezpośrednie wywołanie endpointu `/api/ai/summarize` z logiki zapisu notatki.
  - Zapisz notatkę w bazie danych (Supabase) tylko z `content`, `category_id`, `user_id` i początkowym statusem podsumowania (np. `pending`).
  - Odpowiedz klientowi natychmiast po pomyślnym zapisie notatki, zwracając ID nowo utworzonej notatki.
  - Uruchom proces generowania podsumowania asynchronicznie (patrz punkt 1.3).

#### 1.2. Modyfikacja API Podsumowania (`POST /api/ai/summarize`)

- **Plik:** `src/pages/api/ai/summarize.ts`
- **Zmiany:**
  - Zmień endpoint, aby przyjmował `noteId` jako parametr (np. w ciele żądania lub jako parametr ścieżki `/api/ai/summarize/{noteId}`).
  - Usuń logikę wstawiania nowej notatki (`supabase.from('notes').insert(...)`).
  - Głównym zadaniem tego endpointu będzie:
    - Pobranie treści notatki na podstawie `noteId`.
    - Wywołanie `OpenRouterService.createStructuredChatCompletion` w celu wygenerowania podsumowania.
    - Zaktualizowanie istniejącego rekordu notatki w bazie danych (`supabase.from('notes').update(...)`) o wygenerowane `summary` oraz zmianę statusu podsumowania na `completed` lub `failed`.
    - Dodaj obsługę błędów i aktualizację statusu na `failed` wraz z komunikatem błędu.

#### 1.3. Wprowadzenie Mechanizmu Asynchronicznego Wywołania

- **Opcje:**
  - **Proste Wywołanie Asynchroniczne (MVP):** Bezpośrednio po wysłaniu odpowiedzi w `POST /api/notes`, wywołaj funkcję (np. `triggerSummarization(noteId)`), która _nie_ będzie blokować `return new Response(...)`. Ta funkcja wewnętrznie wywoła (np. przez `fetch`) zmodyfikowany endpoint `POST /api/ai/summarize`. To podejście jest proste, ale mniej niezawodne (np. w przypadku restartu serwera).
  - **Kolejka Zadań (Bardziej Niezawodne):** Zintegruj system kolejkowania zadań (np. BullMQ, jeśli środowisko na to pozwala, lub prostsza implementacja in-memory na początek). `POST /api/notes` dodawałoby zadanie do kolejki (np. `{ type: 'summarize', noteId: '...' }`). Osobny proces (worker) pobierałby zadania z kolejki i wywoływał endpoint `/api/ai/summarize`.
  - **Funkcje Serverless (Supabase Edge Functions):** Jeśli używasz Supabase, rozważ użycie Edge Function. `POST /api/notes` mógłby wywołać Edge Function (`supabase.functions.invoke('summarize-note', { body: { noteId: '...' } })`), która zajęłaby się generowaniem podsumowania.
- **Wybór dla MVP:** Zacznij od prostego wywołania asynchronicznego po odpowiedzi w `POST /api/notes`.

### 2. Zmiany w Bazie Danych (Supabase)

#### 2.1. Aktualizacja Schematu Tabeli `notes`

- **Tabela:** `notes`
- **Zmiany:**
  - Dodaj nową kolumnę `summary_status` typu `TEXT` (lub `ENUM`, jeśli preferowane) z możliwymi wartościami: `pending`, `processing`, `completed`, `failed`. Ustaw wartość domyślną na `pending`.
  - Dodaj nową kolumnę `summary_error_message` typu `TEXT` (nullable) do przechowywania komunikatów błędów w przypadku niepowodzenia.
  - Upewnij się, że kolumna `summary` jest `nullable`.

#### 2.2. Konfiguracja Supabase Realtime

- Włącz publikację (publication) dla tabeli `notes` w ustawieniach Supabase.
- Upewnij się, że Row Level Security (RLS) dla tabeli `notes` jest poprawnie skonfigurowane, aby użytkownicy mogli subskrybować zmiany tylko we własnych notatkach.

### 3. Zmiany we Fronendzie

#### 3.1. Modyfikacja Hooka `useNotes`

- **Plik:** `src/components/hooks/useNotes.ts`
- **Zmiany:**
  - **`saveNote`:**
    - Zmodyfikuj funkcję, aby wywoływała tylko zmodyfikowany endpoint `POST /api/notes`.
    - Usuń wywołanie `fetch('/api/ai/summarize', ...)` i logikę przetwarzania jego odpowiedzi.
    - Po pomyślnym zapisie notatki (otrzymaniu odpowiedzi z `POST /api/notes`), odśwież listę notatek (`loadNotes(categoryId)`) lub optymistycznie dodaj nową notatkę do stanu `notes` z statusem `pending`.
  - **Subskrypcja Realtime:**
    - Użyj klienta Supabase (`supabase-js`) do subskrybowania zmian w tabeli `notes`.
    - W `useEffect` hooka `useNotes`, skonfiguruj subskrypcję nasłuchującą na zdarzenia `UPDATE` w tabeli `notes` dla zalogowanego użytkownika i wybranego `categoryId`.
    - Gdy nadejdzie aktualizacja (np. zmiana `summary` lub `summary_status`), zaktualizuj stan `notes`, modyfikując odpowiednią notatkę na liście. Pamiętaj o prawidłowym zarządzaniu subskrypcją (unsubscribe w funkcji czyszczącej `useEffect`).

#### 3.2. Aktualizacja Komponentów UI

- **Pliki:** `src/components/react/dashboard/DashboardNotesList.tsx`, `src/components/react/dashboard/DashboardNoteDetail.tsx`
- **Zmiany:**
  - **`DashboardNotesList`:**
    - W elemencie listy (`Card`) dla każdej notatki, sprawdź pole `summary_status`.
    - Jeśli status to `pending` lub `processing`, wyświetl wskaźnik ładowania (np. mały spinner lub tekst "Generowanie podsumowania...") obok lub zamiast podglądu podsumowania.
    - Jeśli status to `failed`, wyświetl ikonę błędu lub krótki komunikat (można rozważyć dodanie tooltipa z `summary_error_message`).
    - Wyświetlaj podsumowanie (`note.summary`) tylko gdy status to `completed`.
  - **`DashboardNoteDetail`:**
    - Podobnie jak w liście, w widoku szczegółów notatki, wyświetlaj status generowania podsumowania, jeśli nie jest jeszcze `completed`.
    - Pokaż sekcję podsumowania tylko gdy jest dostępne (`note.summary` istnieje i status to `completed`).
    - Wyświetl komunikat o błędzie, jeśli status to `failed`.

## Przepływ Danych (Po Zmianach)

1.  **Użytkownik** klika "Zapisz Notatkę" w UI.
2.  **Frontend (`useNotes.saveNote`)** wysyła żądanie `POST /api/notes` tylko z treścią notatki i ID kategorii.
3.  **Backend (`POST /api/notes`)**:
    - Zapisuje notatkę w Supabase ze statusem `pending`.
    - Odpowiada do frontendu z sukcesem i ID notatki.
    - _Asynchronicznie_ uruchamia proces podsumowania (np. wywołuje `POST /api/ai/summarize/{noteId}`).
4.  **Frontend (`useNotes`)** otrzymuje odpowiedź, odświeża listę notatek (lub dodaje optymistycznie). Nowa notatka pojawia się na liście ze wskaźnikiem "pending".
5.  **Backend (Proces Asynchroniczny / `POST /api/ai/summarize`)**:
    - Aktualizuje status notatki na `processing`.
    - Pobiera treść notatki.
    - Wywołuje OpenRouter API.
    - Po otrzymaniu podsumowania, aktualizuje rekord notatki w Supabase: dodaje `summary`, zmienia status na `completed`. W razie błędu, aktualizuje status na `failed` i zapisuje błąd.
6.  **Supabase Realtime** wysyła powiadomienie o zmianie w tabeli `notes` do subskrybującego frontendu.
7.  **Frontend (`useNotes` - subskrypcja Realtime)** odbiera aktualizację, aktualizuje stan `notes`.
8.  **UI (`DashboardNotesList`, `DashboardNoteDetail`)** automatycznie renderuje się ponownie, pokazując wskaźnik "processing", a następnie gotowe podsumowanie lub informację o błędzie, gdy tylko dane zostaną zaktualizowane w stanie.
