# Schemat bazy danych PostgreSQL dla projektu LearnFlow AI

Poniższy schemat bazy danych został zaprojektowany w oparciu o dokument wymagań produktu (PRD), notatki z sesji planowania oraz wybrany stos technologiczny. Schemat jest zoptymalizowany pod kątem wydajności, skalowalności oraz bezpieczeństwa danych (m.in. z wykorzystaniem RLS – Row Level Security).

---

## 1. Lista tabel

### 1.1. Tabela `categories`

- **id**: UUID, PRIMARY KEY, domyślnie generowany (np. poprzez funkcję gen_random_uuid())
- **name**: TEXT, NOT NULL, UNIQUE
  - Unikalna nazwa kategorii predefiniowanej.
- **description**: TEXT
  - Opis kategorii (w języku angielskim).
- **created_at**: TIMESTAMP WITH TIME ZONE, NOT NULL, DEFAULT now()
- **updated_at**: TIMESTAMP WITH TIME ZONE, NOT NULL, DEFAULT now()

### 1.2. Tabela `notes`

- **id**: UUID, PRIMARY KEY, domyślnie generowany
- **user_id**: UUID, NOT NULL
  - Klucz obcy do tabeli `auth.users`.
- **category_id**: UUID, NULL
  - Klucz obcy do tabeli `categories` (ON DELETE SET NULL).
- **content**: TEXT, NOT NULL
  - Oryginalna treść notatki; ograniczenie długości (np. CHECK (char_length(content) BETWEEN 300 AND 10000)).
- **summary**: TEXT
  - Wygenerowane podsumowanie notatki.
- **key_points**: TEXT[]
  - Tablica kluczowych punktów wygenerowanych podczas podsumowania.
- **created_at**: TIMESTAMP WITH TIME ZONE, NOT NULL, DEFAULT now()
- **updated_at**: TIMESTAMP WITH TIME ZONE, NOT NULL, DEFAULT now()

### 1.3. Tabela `qa_sets`

- **id**: UUID, PRIMARY KEY, domyślnie generowany
- **note_id**: UUID, NOT NULL
  - Klucz obcy do tabeli `notes` (ON DELETE CASCADE).
- **created_at**: TIMESTAMP WITH TIME ZONE, NOT NULL, DEFAULT now()
- **updated_at**: TIMESTAMP WITH TIME ZONE, NOT NULL, DEFAULT now()

### 1.4. Tabela `questions`

- **id**: UUID, PRIMARY KEY, domyślnie generowany
- **qa_set_id**: UUID, NOT NULL
  - Klucz obcy do tabeli `qa_sets` (ON DELETE CASCADE).
- **question_text**: TEXT, NOT NULL
  - Tekst pytania.
- **answer_text**: TEXT, NOT NULL
  - Tekst odpowiedzi poprawnej.
- **created_at**: TIMESTAMP WITH TIME ZONE, NOT NULL, DEFAULT now()
- **updated_at**: TIMESTAMP WITH TIME ZONE, NOT NULL, DEFAULT now()

---

## 2. Relacje między tabelami

- Tabela `notes` posiada relację wiele-do-jednego z tabelą `auth.users` poprzez kolumnę `user_id`.
- Tabela `notes` posiada relację wiele-do-jednego z tabelą `categories` poprzez kolumnę `category_id` (akcja ON DELETE SET NULL).
- Tabela `qa_sets` jest powiązana z tabelą `notes` relacją jeden-do-wielu poprzez kolumnę `note_id` (akcja ON DELETE CASCADE).
- Tabela `questions` jest powiązana z tabelą `qa_sets` relacją jeden-do-wielu poprzez kolumnę `qa_set_id` (akcja ON DELETE CASCADE).

---

## 3. Indeksy

- **Primary Keys**: Wszystkie tabele posiadają automatycznie indeksowane kolumny wynikające z definicji PRIMARY KEY.
- **Foreign Keys**:
  - Indeks na `notes.user_id` dla szybkiego dostępu do notatek danego użytkownika.
  - Indeks na `notes.category_id` dla przyspieszenia zapytań kategoryzujących.
  - Indeks na `qa_sets.note_id`.
  - Indeks na `questions.qa_set_id`.
- **Dodatkowe indeksy**: Rozważ zastosowanie indeksów na kolumnach `created_at` w tabelach `notes`, `qa_sets` i `questions` dla optymalizacji zapytań sortowanych po dacie.

---

## 4. Zasady PostgreSQL (Row Level Security - RLS)

- **Tabela `notes`**:

  - Włączenie RLS oraz utworzenie polityki umożliwiającej dostęp tylko do notatek przypisanych do aktualnie zalogowanego użytkownika (porównując `user_id` z `auth.uid()`).

  Przykładowa polityka:

  ```sql
  ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
  CREATE POLICY select_notes ON notes
      FOR SELECT
      USING (user_id = auth.uid());
  ```

- **Tabele `qa_sets` i `questions`**:

  - Włączenie RLS oraz utworzenie polityk ograniczających dostęp do rekordów powiązanych z notatkami, które należą do aktualnie zalogowanego użytkownika.

- **Tabela `categories`**:
  - RLS może być wyłączone lub stosowana polityka tylko do odczytu, gdyż kategorie są globalnie predefiniowane.

---

## 5. Dodatkowe uwagi

- Wszystkie identyfikatory są typu UUID. Domyślne generowanie UUID można zaimplementować przy użyciu funkcji takich jak `gen_random_uuid()` lub `uuid_generate_v4()`, w zależności od konfiguracji.
- Kolumny `created_at` i `updated_at` posiadają domyślne wartości ustawione na `now()`. Można rozważyć implementację mechanizmu triggerów do automatycznej aktualizacji `updated_at` przy każdej modyfikacji rekordu.
- Ograniczenie długości pola `content` w tabeli `notes` może być egzekwowane poprzez dodatkowe ograniczenie CHECK, zapewniając, że długość zawartości mieści się w przedziale 300-10000 znaków.
- Kategorie są zarządzane centralnie (poprzez migracje) i nie podlegają modyfikacji przez użytkowników, co upraszcza wdrożenie polityk bezpieczeństwa.
- Schemat został zaprojektowany z myślą o integracji z backendowym systemem Supabase, wykorzystującym wbudowany mechanizm uwierzytelniania (`auth.users`).
