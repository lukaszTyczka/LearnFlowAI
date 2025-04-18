# Plan Implementacji Uwierzytelniania i Autoryzacji dla LearnFlow AI

## 1. Strategia Uwierzytelniania

- Wykorzystam wbudowane mechanizmy Supabase Auth.
- Główna metoda to logowanie za pomocą Email/Hasło; w przyszłości łatwo rozszerzyć o OAuth (np. GitHub).
- Wybór metody jest zgodny z wymaganiami FR-029 i US-012.

## 2. Proces Rejestracji

- Użytkownik będzie mógł rejestrować się jako nowy użytkownik za pomocą standardowego formularza rejestracyjnego umożliwiającego tworzenie kont poprzez email/hasło.
- Funkcjonalność resetowania hasła zostanie wdrożona, umożliwiając bezpieczne odzyskiwanie hasła przez użytkowników.
- W przyszłości rejestracja może być rozszerzona o dodatkowe metody, np. OAuth, oraz o dodatkowe opcje zarządzania kontem.

## 3. Proces Logowania

- Formularz logowania w React umożliwi wprowadzenie emaila i hasła.
- Klient `supabase-js` wyśle dane logowania do Supabase, gdzie nastąpi weryfikacja.
- Błędy logowania (np. niepoprawne hasło, brak konta) będą obsługiwane i komunikowane użytkownikowi.

## 4. Zarządzanie Sesją

- Supabase Auth zarządza sesjami przy użyciu JWT.
- Tokeny są automatycznie odświeżane i przechowywane w local/session storage przeglądarki.
- Użycie mechanizmu w `supabase-js` pozwoli na odtwarzanie stanu sesji przy ponownym wejściu na stronę.

## 5. Ochrona Hasła

- Supabase automatycznie hash'uje i solizuje hasła.
- Wbudowany mechanizm resetowania hasła (choć opcjonalny w MVP) może być wykorzystany do bezpiecznego odzyskiwania hasła.

## 6. Autoryzacja i Ochrona Danych

- Wdrożenie Row Level Security (RLS) w PostgreSQL (Supabase) zapewni, że użytkownik ma dostęp wyłącznie do swoich danych.
- Przykładowe polityki RLS:
  - `notes`: Umożliwia dostęp tylko do notatek, gdzie `user_id` odpowiada `auth.uid()`.
  - `summaries`: Dostęp tylko do powiązanych podsumowań dla danego użytkownika.
  - `qna_sets`: Ograniczenie dostępu do zestawów Q&A przypisanych do użytkownika.
  - `user_feedback`: Dane oceny związane z użytkownikiem.
  - `user_categories`: Kategorie specyficzne dla użytkownika.

_Przykładowa polityka RLS:_

```
CREATE POLICY "notes_owner" ON "notes"
FOR ALL
USING (user_id = auth.uid());
```

## 7. Integracja Frontend (React + TypeScript)

- Użyję klienta `supabase-js` do komunikacji z backendem.
- Implementacja zarządzania stanem uwierzytelnienia przy użyciu React Context API.
- Utworzę hooki do obsługi logowania, rejestracji, wylogowywania oraz utrzymywania sesji.
- Za pomocą komponentów typu "PrivateRoute" lub HOC zabezpieczę trasy dostępne tylko dla zalogowanych użytkowników.

## 8. Integracja Backend (Supabase)

- Supabase zabezpiecza dostęp do danych za pomocą RLS.
- Funkcje (stored procedures) i dodatkowa logika biznesowa mogą być wdrożone dla bardziej złożonych operacji.
- Integracja polityk RLS automatycznie ograniczy widoczność danych do rekordu odpowiadającego aktualnemu `auth.uid()`.

## 9. Bezpieczeństwo

- Walidacja danych wejściowych na poziomie frontendu i backendu.
- Ochrona przed atakami XSS i CSRF:
  - React pomaga minimalizować ryzyko XSS przez automatyczną sanitizację, gdy renderuje dane.
  - Stosowanie tokenów CSRF oraz odpowiednich nagłówków bezpieczeństwa.
- Użycie HTTPS dla zabezpieczenia transmisji danych.
- Dbanie o odpowiednie nagłówki bezpieczeństwa (Content Security Policy, HSTS, itp.).

## 10. Kroki Implementacji (MVP)

1. Konfiguracja projektu Supabase, w tym włączenie Supabase Auth i RLS.
2. Utworzenie predefiniowanego użytkownika dla MVP ("klient zero").
3. Implementacja formularza logowania w React z użyciem `supabase-js`.
4. Dodanie mechanizmu zarządzania stanem uwierzytelnienia (React Context API lub podobne).
5. Wdrożenie podstawowych polityk RLS dla tabel: `notes`, `summaries`, `qna_sets`, `user_feedback`, `user_categories`.
6. Testy przepływu logowania, sesji oraz ograniczonego dostępu do danych.
7. Wdrożenie mechanizmu resetowania hasła.
8. Weryfikacja bezpieczeństwa aplikacji poprzez testy oraz przegląd konfiguracji.

## Podsumowanie

Plan implementacji opiera się na pełnym wykorzystaniu Supabase Auth, RLS oraz klienta `supabase-js` do zapewnienia bezpiecznego środowiska operacyjnego. System zostanie zaprojektowany z myślą o przyszłych możliwościach rozbudowy, zachowując jednocześnie priorytet bezpieczeństwa oraz prostotę wdrożenia w fazie MVP.
