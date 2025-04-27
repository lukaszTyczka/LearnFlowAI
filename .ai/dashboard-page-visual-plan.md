# Plan Wizualny Strony Głównej (Dashboard) - LearnFlowAI

## Cel Główny

Stworzenie funkcjonalnego, przejrzystego i spójnego wizualnie interfejsu użytkownika (dashboardu), który umożliwia łatwe zarządzanie notatkami, przeglądanie kategorii i interakcję z funkcjami AI.

## Ogólny Układ

- **Układ dwukolumnowy:**
  - Lewa kolumna: Sidebar z kategoriami.
  - Prawa kolumna: Główna zawartość (dodawanie notatek, lista notatek).
- **Nagłówek (Header):** Prosty pasek na górze strony.
- **Tło:** Czyste, jasne tło (zgodne z `general-visual-guidelines.md`).

## Struktura Strony (Komponenty)

1.  **Nagłówek (Header):**

    - Pełna szerokość strony.
    - Lewa strona: (Opcjonalnie) Logo/Nazwa aplikacji "LearnFlow AI".
    - Prawa strona: Wyświetlanie adresu email zalogowanego użytkownika, Przycisk "Wyloguj" (Logout) - stylizowany dyskretnie (np. jako link lub przycisk typu `ghost` z Shadcn/ui).
    - Delikatne dolne obramowanie lub cień dla oddzielenia od reszty strony.

2.  **Sidebar (Lewa Kolumna):**

    - Stała szerokość.
    - **Tytuł:** "Kategorie" (Categories) - Wyraźny nagłówek.
    - **Lista Kategorii:**
      - Pionowa lista linków/przycisków reprezentujących kategorie (np. Others, University, Programming, Hardware).
      - Stylizacja aktywnej/wybranej kategorii (np. inne tło, pogrubienie tekstu, kolor akcentu).
      - Efekt :hover dla elementów listy.
      - **(Opcjonalnie) Możliwość dodawania/edycji kategorii w przyszłości.**
      - **(Opcjonalnie) Ikony przy kategoriach dla lepszej identyfikacji wizualnej.**

3.  **Główna Zawartość (Prawa Kolumna):**
    - Zajmuje pozostałą szerokość strony.
    - **Sekcja Dodawania Notatki:**
      - Kontener (np. Shadcn/ui Card) z paddingiem.
      - Pole Tekstowe (`Textarea` z Shadcn/ui):
        - Placeholder: "Wpisz swoją notatkę tutaj... (minimum X, maximum Y znaków)".
        - Rozciągane pionowo.
        - Wyraźne obramowanie, zaokrąglone rogi.
      - Licznik Znaków: Wyświetlanie aktualnej/maksymalnej liczby znaków (np. "500 / 10000"), umieszczony pod polem tekstowym, wyrównany do prawej.
      - Przycisk "Zapisz Notatkę" (`Button` z Shadcn/ui):
        - Styl: Solidny przycisk z kolorem akcentu (fioletowy), spójny z innymi przyciskami akcji.
        - Umieszczony pod polem tekstowym, wyrównany do prawej lub centralnie.
        - Stan `disabled` gdy notatka jest za krótka/za długa lub pusta.
    - **Sekcja Listy Notatek:**
      - **Tytuł Sekcji:** Dynamiczny nagłówek wskazujący wybraną kategorię, np. "Notatki - Programowanie" (Notes - Programming).
      - **Lista Notatek (Karty):**
        - Każda notatka jako osobna karta (`Card` z Shadcn/ui) z paddingiem i delikatnym cieniem/obramowaniem.
        - Górna część karty: Data dodania notatki (np. "26/04/2025").
        - Środkowa część: Podgląd treści notatki (pierwsze kilka linii lub określona liczba znaków).
        - Odstępy między kartami notatek.

## Wytyczne Wizualne Dodatkowe

- **Spójność:** Utrzymanie spójności z `general-visual-guidelines.md` oraz stronami logowania/rejestracji.
- **Hierarchia Wizualna:** Wyraźne rozróżnienie między sidebarem, sekcją dodawania notatek i listą notatek.
- **Czytelność:** Zapewnienie czytelności tekstu notatek i etykiet.
- **Interaktywność:** Wyraźne wskazanie elementów klikalnych (:hover, :focus, aktywna kategoria).
- **Feedback:** Informacje zwrotne dla użytkownika po zapisaniu notatki, usunięciu, generowaniu AI itp. (np. komunikaty toast).
- **Responsywność:** Dostosowanie układu do mniejszych ekranów (np. sidebar może się zwijać lub przechodzić na górę).

## Następne Kroki

1.  Implementacja layoutu strony (Header, Sidebar, Main Content) w Astro.
2.  Stworzenie komponentów React/Astro dla: Note Input Form, Note Card, Category List.
3.  Styling za pomocą Tailwind CSS i Shadcn/ui zgodnie z planem.
4.  Implementacja logiki pobierania/wyświetlania kategorii i notatek.
5.  Implementacja logiki dodawania, edycji, usuwania notatek.
6.  Integracja z endpointami API dla notatek i kategorii.
7.  Implementacja funkcji AI (wywołania API dla podsumowań i quizów).
8.  Testowanie funkcjonalne i wizualne na różnych urządzeniach.
