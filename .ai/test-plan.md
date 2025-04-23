# Plan Testów

## 1. Wprowadzenie i cele testowania

Celem testowania jest zapewnienie odpowiedniej jakości aplikacji poprzez wczesne wykrywanie błędów, weryfikację poprawności działania oraz zgodności ze specyfikacją wymagań. Testy mają na celu sprawdzić integrację technologii takich jak Astro, React, TypeScript, Tailwind oraz Shadcn/ui, aby zapewnić stabilność i użyteczność aplikacji.

## 2. Zakres testów

Zakres testów obejmuje:

- Testy jednostkowe i integracyjne dla komponentów frontendowych (Astro, React) oraz API.
- Kluczowe testy end-to-end (E2E) symulujące najważniejsze interakcje użytkownika z aplikacją.
- Podstawowe testy dostępności (accessibility).
- Testy wizualne i responsywności interfejsu użytkownika.
- Weryfikację podstawowych mechanizmów bezpieczeństwa i autoryzacji.

## 3. Typy testów do przeprowadzenia

- **Testy jednostkowe:** Weryfikacja pojedynczych funkcji i komponentów (przy użyciu Vitest i React Testing Library).
- **Testy integracyjne:** Sprawdzenie poprawności współdziałania między komponentami, warstwą API i bazą danych (np. z użyciem Supertest).
- **Testy E2E:** Symulowane kluczowe scenariusze użytkownika, testowanie najważniejszych przepływów aplikacji (przy użyciu Playwright).
- **Testy dostępności:** Podstawowa weryfikacja zgodności z WCAG przy użyciu narzędzi zintegrowanych z Playwright (np. axe).
- **Testy bezpieczeństwa:** Podstawowa weryfikacja implementacji autoryzacji i uwierzytelniania.

## 4. Scenariusze testowe dla kluczowych funkcjonalności

- **Rejestracja i logowanie:** Sprawdzenie poprawności formularzy, walidacji danych, komunikatów o błędach oraz mechanizmów autoryzacji.
- **Nawigacja i routing:** Testowanie przepływu między stronami Astro oraz interakcji z dynamicznymi komponentami React.
- **Interakcje UI:** Weryfikacja działania komponentów opartych na Shadcn/ui, poprawnego wyświetlania i reakcji na zdarzenia użytkownika.
- **Zapytania do API:** Testy integracyjne endpointów API – poprawność przesyłania danych, obsługa błędów oraz bezpieczeństwo.
- **Responsywność:** Testowanie zachowania aplikacji na urządzeniach o różnych rozdzielczościach i przeglądarkach.

## 5. Środowisko testowe

- **Lokalne środowisko developerskie:** Konfiguracja przy użyciu standardowych narzędzi npm/yarn.
- **Podstawowa integracja CI/CD:** Automatyczne uruchamianie testów przy każdym commitcie i pull request dla kluczowych testów.

## 6. Narzędzia do testowania

- **Vitest i React Testing Library:** Do przeprowadzania testów jednostkowych oraz integracyjnych komponentów React i Astro.
- **Playwright:** Do realizacji scenariuszy E2E oraz podstawowych testów dostępności.
- **Supertest:** Do testowania endpointów API.
- **ESLint i Prettier:** Do zapewnienia jakości kodu i zgodności z ustalonymi standardami.
- **Lighthouse:** Do podstawowej analizy wydajności i dostępności podczas developmentu.

## 7. Uproszczony harmonogram testów

- **Faza przygotowawcza:** Konfiguracja środowiska testowego oraz zdefiniowanie kluczowych scenariuszy testowych.
- **Testy w trakcie developmentu:** Pisanie testów jednostkowych równolegle z rozwojem funkcjonalności.
- **Testy E2E:** Implementacja najważniejszych testów E2E po ukończeniu głównych funkcjonalności.
- **Testy regresyjne:** Uruchamianie zestawu testów przy istotnych zmianach w kodzie.

## 8. Kryteria akceptacji testów

- Pokrycie kodu testami na poziomie 50-70% dla krytycznych funkcjonalności.
- Brak krytycznych błędów w testach E2E dla głównych ścieżek użytkownika.
- Zgodność z podstawowymi standardami dostępności.
- Sprawna praca aplikacji na popularnych przeglądarkach i urządzeniach.

## 9. Role i odpowiedzialności

W kontekście side projectu, odpowiedzialność za testowanie spoczywa głównie na deweloperach. Ważne jest ustalenie:

- Kiedy i jakie testy powinny być pisane
- Które części aplikacji są krytyczne i wymagają dokładniejszego testowania
- Jak utrzymywać balans między rozwojem funkcjonalności a zapewnieniem jakości

## 10. Procedury raportowania błędów

- **Rejestracja błędów:** Błędy będą zgłaszane w systemie zarządzania zadaniami (np. GitHub Issues) z opisem, krokami reprodukcji i oczekiwanym zachowaniem.
- **Priorytetyzacja:** Skupienie na błędach blokujących główne funkcjonalności.
- **Weryfikacja poprawek:** Uruchamianie odpowiednich testów po naprawie błędu.
