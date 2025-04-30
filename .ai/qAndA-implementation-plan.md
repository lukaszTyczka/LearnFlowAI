# Plan Implementacji Funkcji Q&A (FR-013)

## 1. Cel

Implementacja funkcjonalności generowania zestawu pytań testowych typu ABCD na podstawie treści notatki (FR-013 z `.ai/prd.md`), przechowywania ich w bazie danych (FR-022) oraz **asynchronicznego śledzenia statusu generowania i powiadamiania frontendu w czasie rzeczywistym**, wzorując się na implementacji podsumowań (`/src/pages/api/ai/summarize/[id].ts`) i hooka `useNotes.ts`.

## 2. Modyfikacja Bazy Danych (Supabase/PostgreSQL)

- **Zadanie:** Zmodyfikować strukturę tabel `questions` i `notes`.
- **Kroki:**
  1.  Utworzyć nowy plik migracji SQL w `supabase/migrations/` (np. `YYYYMMDDHHMMSS_modify_tables_for_qa.sql`).
  2.  W pliku migracji:
      - **Tabela `questions`:**
        - Dodać kolumny:
          - `option_a TEXT NOT NULL`
          - `option_b TEXT NOT NULL`
          - `option_c TEXT NOT NULL`
          - `option_d TEXT NOT NULL`
        - Usunąć istniejącą kolumnę `answer_text`.
        - Dodać nową kolumnę `correct_option CHAR(1) NOT NULL`.
        - Dodać ograniczenie `CHECK (correct_option IN ('A', 'B', 'C', 'D'))`.
        - Przejrzeć i ewentualnie zaktualizować RLS.
      - **Tabela `notes`:**
        - Dodać kolumny do śledzenia statusu generowania Q&A:
          - `qa_status TEXT DEFAULT 'idle' NOT NULL CHECK (qa_status IN ('idle', 'processing', 'completed', 'failed'))`
          - `qa_error_message TEXT`
        - _Uwaga:_ To centralizuje status zadań AI dla notatki, podobnie jak `summary_status`.

## 3. Backend - API Endpoint (Astro)

- **Zadanie:** Stworzyć endpoint API **inicjujący** proces generowania Q&A.
- **Kroki:**
  1.  Utworzyć plik `/src/pages/api/ai/generate-qa/[id].ts`.
  2.  Zdefiniować dedykowaną klasę błędu `GenerateQAError`.
  3.  Endpoint `POST` powinien:
      - Pobrać `noteId` z `params` i `userId` z `locals`.
      - Sprawdzić autentykację użytkownika.
      - Pobrać notatkę wraz z `qa_status` z bazy danych.
      - Sprawdzić `qa_status`: jeśli `'processing'`, zwrócić błąd 409 (Conflict).
      - Sprawdzić, czy treść notatki spełnia warunki (np. minimalna długość).
      - **Przed wywołaniem AI:** Zaktualizować `qa_status` na `'processing'` i wyczyścić `qa_error_message` w bazie danych. **Ta zmiana będzie propagowana do frontendu przez Supabase Realtime.**
      - Wywołać **asynchronicznie** (bez `await` w głównym przepływie odpowiedzi, jeśli to możliwe, lub w tle) logikę generowania AI (patrz sekcja 4).
      - **Natychmiast** zwrócić odpowiedź sukcesu (np. 202 Accepted), informując, że proces został rozpoczęty. Frontend będzie oczekiwał na aktualizacje statusu przez Realtime.
      - **Logika AI (w tle lub po odpowiedzi 202):**
        - Wywołać `createStructuredChatCompletion` z `OpenRouterService`.
        - **Po udanym wywołaniu AI:**
          - Utworzyć wpis w `qa_sets`.
          - Zapisać pytania w `questions`.
          - Zaktualizować `qa_status` w `notes` na `'completed'`. **Zmiana propagowana przez Realtime.**
        - **W przypadku błędu AI lub zapisu:**
          - Zaktualizować `qa_status` w `notes` na `'failed'` i zapisać `qa_error_message`. **Zmiana propagowana przez Realtime.**
      - **W bloku `catch` obsługi błędów synchronicznych (przed inicjacją AI):**
        - Zwrócić odpowiedź błędu z odpowiednim statusem i komunikatem (np. 400, 401, 404, 409).

## 4. Backend - Logika AI (TypeScript)

- **Zadanie:** Wykorzystanie `OpenRouterService` do strukturalnego generowania Q&A.
- **Kroki:**
  1.  W pliku `src/lib/api/openrouter/openRouter.service.ts`:
  - Potwierdzono istnienie i działanie metody `createStructuredChatCompletion`.
  2.  W logice wywoływanej przez endpoint `generate-qa/[id].ts` (np. w dedykowanej funkcji serwisowej lub bezpośrednio w handlerze po odpowiedzi 202):
  - Zdefiniować schemat Zod (`GeneratedQASchema`) dla oczekiwanej odpowiedzi AI (tablica obiektów Q&A).
  - Sformułować prompt systemowy dla AI.
  - Wywołać `openRouter.createStructuredChatCompletion`, przekazując wiadomości, schemat Zod i nazwę operacji (`'generate_qa'`).
  - Pobrać sparsowany i zwalidowany wynik za pomocą `completion.getParsedJsonPayload()`.
  - Obsłużyć potencjalne błędy zwrócone przez `OpenRouterService` (np. `OpenRouterApiError`, `JsonParsingError`).

## 5. Typy i Walidacja (TypeScript/Zod)

- **Zadanie:** Zdefiniowanie typów i schematów walidacji dla Q&A.
- **Kroki:**
  1.  Zaktualizować typy Supabase (`src/types/database.types.ts`), uwzględniając nowe kolumny w `notes` i zmiany w `questions`.
  2.  Zdefiniować typ `GeneratedQA` i schemat Zod `GeneratedQASchema` w `src/lib/validators/aiValidators.ts` (lub podobnym). Schemat powinien walidować tablicę obiektów, gdzie każdy obiekt ma:
  - `question: z.string()`
  - `options: z.object({ A: z.string(), B: z.string(), C: z.string(), D: z.string() })`
  - `correct_option: z.enum(['A', 'B', 'C', 'D'])`
  3.  Wykorzystać ten schemat w wywołaniu `createStructuredChatCompletion`.

## 6. Frontend (React/Astro & Supabase Realtime)

- **Zadanie:** Wyświetlenie Q&A, statusu generowania i **reakcja na zmiany statusu w czasie rzeczywistym**.
- **Kroki:**
  1.  **Hook (np. `useNotes.ts` lub dedykowany `useNoteDetails`):**
  - Pobierać dane notatki, w tym `id`, `content`, `qa_status`, `qa_error_message`.
  - Pobierać powiązane Q&A (jeśli `qa_status === 'completed'`).
  - **Subskrypcja Supabase Realtime:**
    - Podobnie jak w `useNotes.ts` dla `summary_status`, utworzyć kanał (`supabaseClient.channel(...)`).
    - Nasłuchiwać na zdarzenia `UPDATE` w tabeli `notes` dla konkretnego `user.id`.
    - W callbacku subskrypcji (`payload: RealtimePostgresChangesPayload<Note>`):
      - Sprawdzić, czy zaktualizowana notatka (`payload.new`) dotyczy aktualnie wyświetlanej notatki.
      - Zaktualizować lokalny stan notatki (szczególnie `qa_status` i `qa_error_message`).
      - Jeśli `payload.new.qa_status` zmienił się na `'completed'`: Pokazać toast sukcesu, pobrać i wyświetlić nowo wygenerowane Q&A.
      - Jeśli `payload.new.qa_status` zmienił się na `'failed'`: Pokazać toast błędu z `payload.new.qa_error_message`.
      - Jeśli `payload.new.qa_status` zmienił się na `'processing'`: Zaktualizować UI do stanu ładowania.
  2.  **Komponent React (`src/components/react/`)**:
  - Wykorzystać dane i status z hooka.
  - **UI zależne od `qa_status`:**
    - `'idle'`: Wyświetlić przycisk "Generuj Q&A".
    - `'processing'`: Wyświetlić wskaźnik ładowania.
    - `'completed'`: Wyświetlić Q&A. Przycisk "Generuj ponownie" (opcjonalnie).
    - `'failed'`: Wyświetlić komunikat błędu (`qa_error_message`) i przycisk "Spróbuj ponownie".
  - Logika przycisku "Generuj Q&A" / "Spróbuj ponownie":
    - Wywołać endpoint POST `/api/ai/generate-qa/[noteId]`.
    - Endpoint odpowie szybko (np. 202 Accepted). **Nie trzeba czekać na wynik Q&A w odpowiedzi API.**
    - Można lokalnie ustawić status na `'processing'` w UI od razu po wysłaniu żądania, ale głównym źródłem prawdy będzie aktualizacja z Supabase Realtime.
    - Obsłużyć ewentualne błędy synchroniczne z API (np. 409 Conflict).

## 7. Testowanie

- Napisać testy jednostkowe (Vitest) dla:
  - Nowej klasy `GenerateQAError`.
  - Logiki endpointu API (mockując AI, bazę danych, `locals`), w tym inicjacji procesu w tle.
  - Schematów walidacji Zod (`GeneratedQASchema`).
- Napisać testy E2E (Playwright) dla scenariuszy:
  - Inicjacja generowania Q&A (oczekiwana szybka odpowiedź API).
  - Obserwacja zmiany statusu na `'processing'` w UI (po odpowiedzi API lub przez Realtime).
  - Obserwacja zmiany statusu na `'completed'` i pojawienie się Q&A (przez Realtime).
  - Obserwacja zmiany statusu na `'failed'` i pojawienie się komunikatu błędu (przez Realtime).
  - Próba generowania podczas `'processing'` (oczekiwany błąd 409 z API).
- Przeprowadzić testy manualne weryfikujące asynchroniczność i powiadomienia Realtime.
