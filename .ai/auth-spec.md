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

- Formularz logowania w komponencie React umożliwi wprowadzenie emaila i hasła.
- Dane logowania zostaną wysłane do dedykowanego endpointu API w Astro backend.
- Astro backend, używając serwerowego klienta `supabase-js`, przekaże dane do Supabase Auth w celu weryfikacji.
- Po pomyślnym zalogowaniu, Astro utworzy sesję po stronie serwera, prawdopodobnie ustawiając bezpieczne ciasteczko HTTPOnly w przeglądarce użytkownika.
- Błędy logowania (np. niepoprawne hasło, brak konta) będą obsługiwane przez Astro i komunikowane z powrotem do frontendu React.

## 4. Zarządzanie Sesją

- Sesje użytkownika będą zarządzane przez Astro backend, wykorzystując mechanizmy takie jak bezpieczne ciasteczka (HTTPOnly, Secure, SameSite).
- Astro middleware będzie przechwytywać przychodzące żądania, weryfikować istnienie i ważność ciasteczka sesji.
- W razie potrzeby (np. wygaśnięcie tokenu Supabase powiązanego z sesją serwera), Astro backend będzie odpowiedzialny za komunikację z Supabase Auth w celu odświeżenia tokenu i utrzymania ciągłości sesji użytkownika, bez bezpośredniej interakcji frontendu z tokenami Supabase.
- Frontend React będzie polegał na istnieniu sesji zarządzanej przez Astro do określania stanu zalogowania użytkownika. Informacje o stanie sesji mogą być przekazywane do frontendu np. poprzez dedykowany endpoint lub podczas renderowania strony przez Astro.

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

- Komponenty React będą komunikować się z endpointami API udostępnianymi przez Astro backend w celu realizacji operacji uwierzytelniania (logowanie, rejestracja, wylogowanie) oraz dostępu do chronionych zasobów.
- Frontend nie będzie bezpośrednio zarządzał tokenami JWT Supabase ani używał klienta `supabase-js` do operacji uwierzytelniania. Klient `supabase-js` może być potencjalnie używany na frontendzie do subskrypcji zmian w czasie rzeczywistym, jeśli będzie to wymagane i odpowiednio skonfigurowane z sesją zarządzaną przez Astro.
- Implementacja zarządzania stanem uwierzytelnienia w React (np. przy użyciu React Context API) będzie opierać się na informacjach o sesji otrzymanych z Astro backend.
- Ochrona tras w React (komponenty typu "PrivateRoute") będzie bazować na stanie zalogowania użytkownika zarządzanym centralnie i odzwierciedlającym sesję serwerową Astro.

## 8. Integracja Backend (Astro + Supabase)

- Astro będzie pełniło rolę backendu/middleware, obsługując logikę biznesową i komunikację z Supabase.
- Astro użyje serwerowego klienta `supabase-js` do interakcji z Supabase Auth (rejestracja, logowanie, weryfikacja) oraz Supabase Database (operacje CRUD na danych).
- Astro middleware będzie kluczowym elementem do ochrony endpointów API oraz stron, sprawdzając stan sesji użytkownika przed zezwoleniem na dostęp.
- Polityki Row Level Security (RLS) w Supabase pozostają fundamentem ochrony danych na poziomie bazy danych, zapewniając, że nawet backend Astro (działający z uprawnieniami użytkownika pobranymi z sesji) ma dostęp tylko do odpowiednich danych.

## 9. Bezpieczeństwo

- Walidacja danych wejściowych na poziomie frontendu (React) i backendu (Astro).
- Ochrona przed atakami XSS: React i Astro pomagają minimalizować ryzyko. Należy dbać o odpowiednią sanitizację danych zwracanych przez API Astro.
- Ochrona przed atakami CSRF: Użycie ciasteczek HTTPOnly zarządzanych przez Astro backend znacząco podnosi poziom ochrony przed atakami CSRF. Rozważenie dodatkowych mechanizmów (np. SameSite cookies, tokeny anty-CSRF dla specyficznych operacji) może być wskazane.
- Użycie HTTPS dla zabezpieczenia transmisji danych między przeglądarką a Astro oraz między Astro a Supabase.
- Dbanie o odpowiednie nagłówki bezpieczeństwa ustawiane przez Astro (Content Security Policy, HSTS, itp.).

## 10. Kroki Implementacji (MVP)

1. Konfiguracja projektu Supabase (Auth, RLS, baza danych).
2. Konfiguracja projektu Astro, w tym ustawienie integracji z React i TypeScript.
3. Implementacja endpointów API w Astro dla rejestracji, logowania i wylogowania, wykorzystujących serwerowy `supabase-js`.
4. Implementacja Astro middleware do zarządzania sesją (tworzenie/weryfikacja ciasteczek) i ochrony tras/endpointów.
5. Implementacja formularzy i logiki w React do komunikacji z API Astro.
6. Dodanie mechanizmu zarządzania stanem uwierzytelnienia w React, bazującego na sesji Astro.
7. Wdrożenie podstawowych polityk RLS w Supabase.
8. Testy kompleksowe przepływu uwierzytelniania (rejestracja, logowanie, sesja, ochrona tras, wylogowanie) oraz dostępu do danych.
9. Wdrożenie mechanizmu resetowania hasła (poprzez przepływ Astro -> Supabase).
10. Weryfikacja bezpieczeństwa (nagłówki, ciasteczka, RLS).

## Podsumowanie

Zaktualizowany plan implementacji wykorzystuje Astro jako warstwę pośredniczącą (backend/middleware), co centralizuje logikę uwierzytelniania i zarządzania sesją po stronie serwera. Zwiększa to bezpieczeństwo (m.in. przez ciasteczka HTTPOnly) i oddziela frontend od bezpośredniej interakcji z tokenami Supabase. Integracja z Supabase Auth i RLS pozostaje kluczowa, ale jest obsługiwana przez backend Astro.
