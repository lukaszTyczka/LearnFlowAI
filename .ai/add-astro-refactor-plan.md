# Plan Refaktoryzacji Projektu LearnFlowAI do Astro

## Cel

Celem tego planu jest migracja istniejącej aplikacji LearnFlowAI (opartej prawdopodobnie głównie na React po stronie klienta z bezpośrednią integracją z Supabase) do architektury wykorzystującej Astro jako główny framework. Astro będzie pełnić rolę zarówno frameworka do budowy UI (z możliwością użycia React dla interaktywnych wysp), jak i backendu/middleware do komunikacji z Supabase i innymi serwisami. Ma to na celu poprawę wydajności (SSR/SSG), bezpieczeństwa (zarządzanie sesją po stronie serwera) oraz struktury projektu.

## Odniesienia

- Nowa struktura projektu: @project-structure.md
- Zaktualizowany Tech Stack: @tech-stack.md
- Zaktualizowana specyfikacja autentykacji: @auth-spec.md
- Diagram przepływu autentykacji: @diagrams/auth.md
- Wzorcowa inicjalizacja Supabase w Astro: @api-supabase-astro-init.mdc

## Fazy Refaktoryzacji

### Faza 1: Przygotowanie i Konfiguracja Astro

1.  **Inicjalizacja projektu Astro:** Utworzenie nowego projektu Astro lub integracja Astro z istniejącym monorepo (jeśli dotyczy).
2.  **Instalacja zależności:** Dodanie Astro, integracji `@astrojs/react`, `@astrojs/tailwind`, klienta `supabase-js` (do użytku serwerowego), oraz innych niezbędnych bibliotek (np. Zod do walidacji).
3.  **Konfiguracja Astro:** Skonfigurowanie `astro.config.mjs` (integracje React, Tailwind, tryb `server` dla SSR), `tailwind.config.mjs`, `tsconfig.json`.
4.  **Struktura katalogów:** Utworzenie podstawowej struktury katalogów zgodnie z @project-structure.md.
5.  **Zmienne Środowiskowe:** Utworzenie/Aktualizacja pliku `.env.example`. **Kluczowe:** Zmienne używane po stronie serwera (np. `SUPABASE_URL`, `SUPABASE_KEY`, `OPENROUTER_API_KEY`) **nie powinny** mieć prefixu `PUBLIC_` (ani `VITE_`). Należy usunąć prefixy z istniejących kluczy serwerowych (np. zmienić `VITE_SUPABASE_URL` na `SUPABASE_URL`) i dodać brakujące klucze serwerowe.
6.  **Podstawowy layout:** Stworzenie głównego layoutu aplikacji w `src/layouts/BaseLayout.astro` (np. z podstawową strukturą HTML, integracją globalnych styli, podpięciem Tailwind).

### Faza 2: Implementacja Autentykacji w Astro

1.  **Konfiguracja klienta Supabase (Server):** Skonfigurowanie serwerowego klienta Supabase w `src/db/` do użytku w Astro (API routes, middleware).
2.  **Middleware sesji:** Implementacja middleware Astro (`src/middleware/index.ts`) do zarządzania sesją użytkownika:
    - Odczytywanie tokena z bezpiecznego ciasteczka HTTPOnly.
    - Weryfikacja tokena przy użyciu serwerowego klienta Supabase.
    - Odświeżanie tokena w razie potrzeby.
    - Dodawanie informacji o użytkowniku/sesji do `Astro.locals` dla dostępu w stronach i API routes.
    - Obsługa przekierowań dla niezalogowanych użytkowników próbujących uzyskać dostęp do chronionych stron.
3.  **API Routes dla Autentykacji:** Stworzenie endpointów API w `src/pages/api/auth/`:
    - `login.ts`: Przyjmuje email/hasło, używa serwerowego klienta Supabase do logowania, ustawia bezpieczne ciasteczko sesji po sukcesie.
    - `register.ts`: Przyjmuje dane rejestracyjne, używa serwerowego klienta Supabase do rejestracji.
    - `logout.ts`: Usuwa sesję Supabase i ciasteczko sesji.
    - `session.ts`: Zwraca aktualny stan sesji użytkownika (np. email, ID) na podstawie danych z `Astro.locals` (dla frontendu).
4.  **Aktualizacja komponentów React:** Zmodyfikowanie istniejących komponentów formularzy logowania/rejestracji w React, aby wysyłały żądania (np. za pomocą `fetch`) do nowo utworzonych endpointów API Astro, zamiast bezpośrednio używać `supabase-js`.
5.  **Zarządzanie stanem w React:** Dostosowanie logiki zarządzania stanem uwierzytelnienia w React, aby opierała się na danych z endpointu `/api/auth/session` lub danych przekazanych z Astro (jeśli komponent jest renderowany na serwerze).

### Faza 3: Migracja Widoków i Logiki Biznesowej

1.  **Przeniesienie routingu:** Zastąpienie istniejącego systemu routingu (np. React Router) routingiem opartym na plikach Astro w `src/pages/`.
2.  **Konwersja komponentów na Astro/React Islands:**
    - **Identyfikacja:** Podział istniejących komponentów React na:
      - **Statyczne/Prezentacyjne:** Możliwe do przepisania jako komponenty `.astro`.
      - **Interaktywne:** Wymagające JavaScript po stronie klienta (formularze, dynamiczne listy, itp.) - pozostaną jako komponenty React.
    - **Migracja:**
      - Przepisanie komponentów statycznych na `.astro`.
      - Umieszczenie interaktywnych komponentów React w `src/components/react/` (lub `ui/`) i użycie ich w stronach/layoutach `.astro` z odpowiednią dyrektywą `client:*` (np. `client:load`, `client:idle`).
3.  **Migracja pobierania danych:**
    - Przeniesienie logiki pobierania danych potrzebnych do renderowania strony z komponentów React do części `---` (frontmatter) stron `.astro` lub do dedykowanych API routes w Astro.
    - Astro będzie pobierać dane po stronie serwera (używając serwerowego klienta Supabase) i przekazywać je jako `props` do komponentów `.astro` lub React Islands.
    - Dla danych dynamicznie ładowanych po stronie klienta (np. po akcji użytkownika w React Island), komponent React będzie wywoływał dedykowane API route Astro (np. `/api/notes`).
4.  **Refaktoryzacja serwisów (`src/lib/`):**
    - Serwisy/funkcje pomocnicze używane wyłącznie po stronie serwera (np. komunikacja z AI, Supabase) pozostają w `src/lib/` i są importowane w API routes lub frontmatter stron Astro.
    - Funkcje pomocnicze potrzebne w komponentach React (Islands) mogą pozostać w `src/lib/`, ale powinny być świadome, że działają w przeglądarce (np. używają `fetch` do komunikacji z API Astro, a nie serwerowego `supabase-js`).
5.  **API Routes dla Danych:** Stworzenie endpointów API w Astro (np. `src/pages/api/notes/`, `src/pages/api/ai/`) do obsługi operacji CRUD i interakcji z AI, wywoływanych przez frontend (React Islands).
    - Te endpointy będą chronione przez middleware Astro, sprawdzając sesję użytkownika.
    - Będą używać serwerowego klienta Supabase i logiki z `src/lib/`.

### Faza 4: Testowanie i Wdrożenie

1.  **Testowanie:**
    - Testy jednostkowe dla logiki w `src/lib/`.
    - Testy API dla endpointów w `src/pages/api/`.
    - Testy E2E (np. za pomocą Playwright lub Cypress) dla kluczowych przepływów użytkownika (logowanie, dodawanie notatki, generowanie AI).
    - Testy komponentów React (jeśli istnieją). Adaptacja do nowego sposobu przekazywania danych (props zamiast bezpośredniego fetch/context).
2.  **Optymalizacja:** Analiza wydajności (Lighthouse), optymalizacja ładowania zasobów, strategii renderowania Astro (SSG/SSR).
3.  **Konfiguracja CI/CD:** Aktualizacja pipeline'u CI/CD do budowania (`astro build`) i wdrażania aplikacji Astro (wymaga środowiska Node.js).
4.  **Monitoring i Logowanie:** Wdrożenie mechanizmów monitorowania i logowania błędów po stronie serwera Astro.

### Faza 5: Czyszczenie

1.  **Usunięcie zbędnych zależności:** Odinstalowanie bibliotek specyficznych dla poprzedniej architektury, które nie są już potrzebne (np. React Router, jeśli zastąpiony przez Astro routing).
2.  **Usunięcie starego kodu:** Usunięcie nieużywanych komponentów React, hooków, logiki po stronie klienta, która została przeniesiona do Astro.
3.  **Refaktoryzacja:** Przegląd kodu pod kątem spójności, duplikacji i zgodności z nową architekturą.

## Dobre Praktyki

- **Server-First:** Preferowanie renderowania po stronie serwera (SSR/SSG) przez Astro dla maksymalnej wydajności i SEO.
- **Minimalny JavaScript:** Używanie React Islands (`client:*`) tylko tam, gdzie interaktywność jest absolutnie konieczna.
- **Bezpieczeństwo:** Zarządzanie sesją i komunikacja z Supabase głównie po stronie serwera (Astro middleware, API routes).
- **Separacja:** Wyraźne oddzielenie logiki serwerowej (Astro) od klienckiej (React Islands).
- **Zarządzanie stanem w React (Islands):** Na początkowym etapie refaktoryzacji skupić się na użyciu podstawowych hooków React (`useState`, `useEffect`) do zarządzania stanem lokalnym wysp. Unikać wprowadzania złożonych bibliotek do zarządzania stanem globalnym, dopóki nie okaże się to absolutnie konieczne. Komunikacja między wyspami i aktualizacja danych powinna opierać się głównie na wywoływaniu API Astro i przekazywaniu zaktualizowanych `props`.
- **Walidacja:** Stosowanie walidacji danych (np. Zod) zarówno w API routes Astro, jak i opcjonalnie w formularzach React.
- **Typowanie:** Pełne wykorzystanie TypeScript w całym stosie (Astro, React, lib).
