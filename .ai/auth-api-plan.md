# Plan API Astro: Uwierzytelnianie

Ten dokument opisuje punkty końcowe API do obsługi uwierzytelniania użytkowników w backendzie Astro, używane przez komponenty frontendowe React.

**Odniesienie:** @astro-api-guidelines.mdc

## Punkty końcowe (Endpoints)

### 1. Logowanie Użytkownika

- **Ścieżka:** `POST /api/auth/login`
- **Opis:** Uwierzytelnia użytkownika na podstawie adresu e-mail i hasła.
- **Ciało żądania (Request Body):**
  ```json
  { "email": "user@example.com", "password": "userpassword" }
  ```
- **Walidacja:** Użyj schematu Zod (`src/lib/validators/auth.ts`) do walidacji formatu adresu e-mail i hasła.
- **Logika handlera (`src/pages/api/auth/login.ts`):**
  1.  Zwaliduj ciało żądania.
  2.  Wywołaj klienta serwerowego Supabase (`supabase.auth.signInWithPassword`).
  3.  W przypadku sukcesu:
      - Wyodrębnij dane sesji (token dostępu, token odświeżania, data wygaśnięcia).
      - Ustaw bezpieczne ciasteczka HTTPOnly dla tokenów sesji (np. `sb-access-token`, `sb-refresh-token`) używając `Astro.cookies.set()`.
      - Zwróć odpowiedź sukcesu (np. status 200, informacje o użytkowniku bez danych wrażliwych).
  4.  W przypadku niepowodzenia:
      - Zwróć odpowiednią odpowiedź błędu (np. status 400 dla błędów walidacji, 401 dla nieprawidłowych poświadczeń).
- **Uwierzytelnianie:** Publiczny punkt końcowy.

### 2. Rejestracja Użytkownika

- **Ścieżka:** `POST /api/auth/register`
- **Opis:** Tworzy nowe konto użytkownika.
- **Ciało żądania:**
  ```json
  { "email": "newuser@example.com", "password": "newpassword123" }
  ```
- **Walidacja:** Użyj schematu Zod (`src/lib/validators/auth.ts`) dla wymagań dotyczących adresu e-mail i hasła.
- **Logika handlera (`src/pages/api/auth/register.ts`):**
  1.  Zwaliduj ciało żądania.
  2.  Wywołaj klienta serwerowego Supabase (`supabase.auth.signUp`).
  3.  Obsłuż odpowiedź Supabase (sukces lub błąd, np. użytkownik już istnieje).
  4.  Zwróć odpowiednią odpowiedź (np. status 201 przy sukcesie, 400/409 przy błędzie).
      _Uwaga: Przepływ weryfikacji e-mail może być obsługiwany bezpośrednio przez Supabase._
- **Uwierzytelnianie:** Publiczny punkt końcowy.

### 3. Wylogowanie Użytkownika

- **Ścieżka:** `POST /api/auth/logout`
- **Opis:** Wylogowuje bieżącego użytkownika, unieważniając jego sesję.
- **Ciało żądania:** Brak.
- **Logika handlera (`src/pages/api/auth/logout.ts`):**
  1.  Sprawdź, czy użytkownik jest zalogowany (np. weryfikując ciasteczka przez klienta Supabase lub dane middleware w `Astro.locals`).
  2.  Wywołaj klienta serwerowego Supabase (`supabase.auth.signOut`). Może to wymagać przekazania tokenu dostępu z ciasteczka, jeśli nie jest obsługiwane automatycznie przez klienta serwerowego na podstawie ciasteczek.
  3.  Usuń ciasteczka sesji używając `Astro.cookies.delete()`.
  4.  Zwróć odpowiedź sukcesu (np. status 200).
- **Uwierzytelnianie:** Wymaga aktywnej sesji (zweryfikowanej przez middleware lub handler).

### 4. Pobranie Statusu Sesji

- **Ścieżka:** `GET /api/auth/session`
- **Opis:** Pobiera informacje o aktualnie zalogowanym użytkowniku, jeśli istnieje.
- **Ciało żądania:** Brak.
- **Logika handlera (`src/pages/api/auth/session.ts`):**
  1.  Opiera się na middleware Astro, które wypełniło `Astro.locals.user` lub `Astro.locals.session`.
  2.  Jeśli `locals.user` istnieje, zwróć dane użytkownika (np. id, email). Odfiltruj dane wrażliwe.
  3.  Jeśli `locals.user` nie istnieje, zwróć null lub pusty obiekt ze statusem 200 (lub 401, jeśli preferowane).
- **Uwierzytelnianie:** Publiczny punkt końcowy, ale zwraca dane użytkownika tylko po uwierzytelnieniu (middleware obsługuje sprawdzanie sesji).
