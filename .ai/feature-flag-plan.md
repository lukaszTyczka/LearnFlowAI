# Plan Implementacji Flag Funkcji

Ten dokument opisuje kroki wdrożenia możliwości zarządzania flagami funkcji w projekcie LearnFlowAI.
**Uwaga** Na razie nie będę implementował feature flag. Zostawię to na później.

## 1. Wybór Rozwiązania do Zarządzania Flagami Funkcji

- **Zadanie:** Wybór sposobu zarządzania flagami funkcji.
- **Decyzja:** Zostanie zaimplementowane **własne, proste rozwiązanie oparte na plikach konfiguracyjnych JSON**, oddzielnych dla każdego środowiska (local, test, production). Pozwoli to na wersjonowanie flag razem z kodem i uniknięcie zewnętrznych zależności oraz kosztów.

## 2. Konfiguracja

- **Zadanie:** Zdefiniowanie struktury i sposobu ładowania konfiguracji flag funkcji z plików JSON.
- **Struktura Plików:**
  - Utworzenie katalogu `config/` w głównym folderze projektu.
  - Wewnątrz `config/` znajdą się pliki JSON, np.:
    - `config/flags.base.json` (opcjonalnie: wspólne wartości domyślne)
    - `config/flags.local.json` (dla środowiska lokalnego deweloperskiego)
    - `config/flags.test.json` (dla środowiska testowego/stagingu)
    - `config/flags.production.json` (dla środowiska produkcyjnego)
- **Format Plików JSON:** Prosta struktura klucz-wartość (obiekt JSON), gdzie kluczem jest nazwa flagi, a wartością `true` lub `false`.
  ```json
  // Przykład: config/flags.production.json
  {
    "enableNewDashboard": true,
    "showBetaWarning": false,
    "useNewAISummarizer": true
  }
  ```
- **Implementacja Ładowania:**
  - Utworzenie logiki (np. w `src/lib/feature-flags/config.ts`), która:
    - Odczytuje zmienną środowiskową określającą bieżące środowisko (np. `process.env.NODE_ENV` lub dedykowaną `APP_ENV`).
    - Wczytuje odpowiedni plik `config/flags.<środowisko>.json` (oraz opcjonalnie `flags.base.json`).
    - Przechowuje wczytaną konfigurację w pamięci, aby była łatwo dostępna podczas działania aplikacji (konfiguracja ładowana przy starcie serwera).

## 3. Integracja Backendu (Astro)

- **Zadanie:** Zintegrowanie logiki odczytu flag z backendem Astro.
- **Kroki:**
  - Utworzenie dedykowanego modułu `src/lib/feature-flags/` zawierającego logikę ładowania konfiguracji (jak w punkcie 2) oraz funkcję do sprawdzania flag.
  - Zaimplementowanie funkcji pomocniczej `isFeatureEnabled(flagName: string): boolean`, która odczytuje wartość flagi z wczytanej konfiguracji przechowywanej w pamięci.
  - Zintegrowanie wywołań `isFeatureEnabled('nazwa_flagi')` w:
    - Middleware Astro (dla request-level gating, jeśli potrzebne).
    - Ścieżkach API (`src/pages/api/`).
    - Logice renderowania po stronie serwera w stronach/komponentach `.astro`.
- **Kontekst:** W tym podejściu kontekst użytkownika czy sesji nie jest bezpośrednio używany do dynamicznego przełączania flag (flagi są globalne dla danego środowiska/deploymentu).

## 4. Integracja Frontendu (Astro/React)

- **Zadanie:** Udostępnienie stanów flag funkcji komponentom frontendowym.
- **Strategie:**
  - **Komponenty Astro (`.astro`):** Ocena flag po stronie serwera (`isFeatureEnabled`) podczas renderowania i warunkowe renderowanie znaczników.
  - **Komponenty React (Wyspy):** Przekazywanie stanów flag jako propsy z nadrzędnej strony `.astro` (oceniane po stronie serwera). Klient nie musi znać mechanizmu flagowania.
- **Implementacja:** Dostosowanie komponentów do warunkowego renderowania elementów UI lub włączania/wyłączania funkcjonalności na podstawie przekazanych stanów flag.

## 5. Implementacja i Wytyczne Użytkowania

- **Zadanie:** Zaimplementowanie podstawowej przykładowej flagi w celu weryfikacji konfiguracji end-to-end.
- **Przykład:** Utworzenie flagi `enableNewNoteInput` w plikach JSON i użycie `isFeatureEnabled('enableNewNoteInput')` w odpowiednim komponencie `.astro` lub stronie, aby warunkowo wyświetlić nowy formularz dodawania notatek.
- **Wytyczne:** Dokumentowanie konwencji nazewnictwa flag (np. `camelCase`, prefiksy `enable`, `show`, `use`), miejsc umieszczania sprawdzania oraz strukturyzowania kodu w celu łatwego późniejszego usunięcia flagi i martwego kodu.

## 6. Zarządzanie i Strategia Wdrożenia

- **Zadanie:** Zdefiniowanie procesów zarządzania flagami w oparciu o pliki JSON.
- **Proces:**
  - **Dodawanie/Modyfikacja flagi:** Edycja odpowiednich plików `config/flags.*.json`.
  - **Włączanie/Wyłączanie flagi:** Zmiana wartości (`true`/`false`) w pliku JSON dla danego środowiska.
  - **Wdrożenie zmiany:** **Zmiany w plikach JSON wymagają zatwierdzenia (commit) w systemie kontroli wersji (Git) i wdrożenia (deploy) nowej wersji aplikacji, aby stały się aktywne.** Ten system nie pozwala na dynamiczne przełączanie flag w czasie rzeczywistym bez deploymentu.
  - **Strategie wdrażania:** To podejście obsługuje tylko proste włączanie/wyłączanie funkcji dla całego środowiska. Bardziej złożone strategie (procentowe, per użytkownik) wymagałyby znaczącej rozbudowy lub zmiany podejścia.
  - **Usuwanie flag:** Po pełnym wdrożeniu funkcji, należy usunąć flagę z plików JSON oraz usunąć warunkową logikę (`if (isFeatureEnabled(...))`) z kodu aplikacji.

## 7. Testowanie

- **Zadanie:** Zapewnienie poprawnego działania systemu flag.
- **Kroki:**
  - Napisanie testów jednostkowych dla logiki ładowania konfiguracji i funkcji `isFeatureEnabled` w `src/lib/feature-flags/`.
  - Testowanie (manualne lub E2E), jak aplikacja zachowuje się z różnymi ustawieniami flag w plikach konfiguracyjnych dla różnych środowisk.

## 8. Dokumentacja

- **Zadanie:** Udokumentowanie systemu flag funkcji dla deweloperów.
- **Lokalizacja:** Zaktualizowanie `README.md` lub utworzenie dedykowanego pliku `docs/feature-flags.md`.
- **Zawartość:** Wyjaśnienie użycia plików JSON, lokalizacji (`config/`), sposobu ładowania, jak sprawdzać flagi (`isFeatureEnabled`), jak dodawać nowe flagi oraz procesu zarządzania (edycja JSON + deploy).
