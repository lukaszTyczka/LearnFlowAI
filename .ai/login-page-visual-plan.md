# Plan Wizualny Strony Logowania (Login Page) - LearnFlowAI

## Cel Główny

Zaprojektowanie przejrzystej, bezpiecznej i łatwej w użyciu strony logowania, spójnej wizualnie z resztą aplikacji LearnFlowAI.

## Ogólny Układ

- Strona wycentrowana, z formularzem logowania jako głównym elementem.
- Czyste, jasne tło (zgodne ze stroną startową - białe lub bardzo jasnoszare).

## Struktura Strony (Komponenty)

1.  **Kontener Formularza:**

    - Wycentrowany na stronie (pionowo i poziomo).
    - Zaokrąglone rogi.
    - Delikatny cień (box-shadow) dla lepszego oddzielenia od tła (zamiast obramowania widocznego na zrzucie).
    - Odpowiedni padding wewnętrzny dla przestrzeni.

2.  **Elementy Formularza (Wewnątrz Kontenera):**

    - **(Opcjonalnie) Logo Aplikacji:** Można umieścić małe logo "LearnFlow AI" nad tytułem formularza dla wzmocnienia marki.
    - **Tytuł (H1 lub H2):** "Zaloguj się" (Login) - Wyraźny, pogrubiony, zgodny z typografią z `general-visual-guidelines.md`.
    - **Podtytuł:** "Wprowadź swoje dane, aby uzyskać dostęp do konta." (Enter your credentials...) - Mniejszy tekst pod tytułem.
    - **Pola Wejściowe (Inputs):**
      - **Email:**
        - Etykieta: "Email"
        - Pole Input: Zaokrąglone rogi, standardowe obramowanie. Placeholder: "Wpisz swój email".
        - Stylizacja :hover i :focus dla wskazania interakcji.
        - Obsługa błędów: Zmiana koloru obramowania (np. na czerwony) i wyświetlenie komunikatu błędu pod polem w razie potrzeby.
        - Rozważyć usunięcie ikony w polu (jeśli nie ma konkretnej funkcji) dla uproszczenia.
      - **Hasło (Password):**
        - Etykieta: "Hasło"
        - Pole Input (type="password"): Stylizacja jak pole Email. Placeholder: "Wpisz swoje hasło".
        - Obsługa błędów: Jak w polu Email.
        - **(Opcjonalnie) Ikona Pokaż/Ukryj Hasło:** Zamiast ikony ze zrzutu, można dodać ikonę oka do przełączania widoczności hasła.
    - **Link "Zapomniałeś hasła?" (Forgot Password?):**
      - Umieszczony pod polem hasła, wyrównany do prawej lub centralnie.
      - Stylizowany jako dyskretny link (np. kolor akcentu lub neutralny, podkreślenie przy najechaniu).
    - **Przycisk Główny (Login Button):**
      - Tekst: "Zaloguj się"
      - Styl: **Solidny przycisk** z kolorem akcentu (fioletowy) jako tłem i białym tekstem. Pełna szerokość kontenera lub dopasowana do treści z odpowiednim paddingiem.
      - Zaokrąglone rogi, spójne z polami input.
      - Efekt :hover.
    - **Link Rejestracji (Register Link):**
      - Tekst: "Nie masz konta? Zarejestruj się" (Don't have an account? Register)
      - Umieszczony pod przyciskiem logowania.
      - Stylizowany jako tekst z linkiem (np. "Zarejestruj się" jako link w kolorze akcentu).

3.  **(Opcjonalnie) Stopka (Footer):**
    - Można dodać minimalistyczną stopkę z prawami autorskimi, jeśli jest to wymagane dla spójności.

## Wytyczne Wizualne Dodatkowe

- **Spójność:** Utrzymać spójność z `general-visual-guidelines.md` (paleta kolorów, typografia).
- **Minimalizm:** Unikać zbędnych elementów, skupić się na funkcjonalności logowania.
- **Feedback dla Użytkownika:** Jasne wskazanie stanu pól (aktywne, błąd) oraz procesu logowania (np. stan ładowania na przycisku po kliknięciu).
- **Responsywność:** Formularz musi dobrze wyglądać i działać na urządzeniach mobilnych.

## Następne Kroki

1.  Implementacja struktury HTML/React/Astro dla formularza.
2.  Styling za pomocą Tailwind CSS zgodnie z planem.
3.  Implementacja logiki walidacji po stronie klienta.
4.  Połączenie z endpointem API logowania.
5.  Testowanie funkcjonalne i wizualne.
