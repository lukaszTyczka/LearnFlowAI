# Plan Wizualny Strony Rejestracji (Register Page) - LearnFlowAI

## Cel Główny

Zaprojektowanie przejrzystej, bezpiecznej i łatwej w użyciu strony rejestracji, spójnej wizualnie z resztą aplikacji LearnFlowAI, umożliwiającej użytkownikom szybkie utworzenie nowego konta.

## Ogólny Układ

- Strona wycentrowana, z formularzem rejestracji jako głównym elementem.
- Czyste, jasne tło (zgodne ze stroną startową i logowania - białe lub bardzo jasnoszare).

## Struktura Strony (Komponenty)

1.  **Kontener Formularza:**

    - Wycentrowany na stronie (pionowo i poziomo).
    - Stylizacja identyczna jak kontener logowania: zaokrąglone rogi, delikatny cień (box-shadow), odpowiedni padding wewnętrzny.

2.  **Elementy Formularza (Wewnątrz Kontenera):**

    - **(Opcjonalnie) Logo Aplikacji:** Małe logo "LearnFlow AI" nad tytułem formularza.
    - **Tytuł (H1 lub H2):** "Zarejestruj się" (Register) - Wyraźny, pogrubiony, zgodny z typografią z `general-visual-guidelines.md`.
    - **Podtytuł:** "Utwórz nowe konto, aby uzyskać dostęp." (Create a new account...) - Mniejszy tekst pod tytułem.
    - **Pola Wejściowe (Inputs):**
      - **Email:**
        - Etykieta: "Email"
        - Pole Input: Stylizacja jak na stronie logowania (zaokrąglone rogi, standardowe obramowanie, placeholder: "Wpisz swój email").
        - Stylizacja :hover/:focus.
        - Obsługa błędów (wizualna informacja zwrotna).
        - Rozważyć usunięcie ikony w polu dla uproszczenia.
      - **Hasło (Password):**
        - Etykieta: "Hasło"
        - Pole Input (type="password"): Stylizacja jak pole Email. Placeholder: "Wpisz swoje hasło".
        - Obsługa błędów.
        - **(Opcjonalnie) Ikona Pokaż/Ukryj Hasło.**
      - **Potwierdź Hasło (Confirm Password):**
        - Etykieta: "Potwierdź Hasło"
        - Pole Input (type="password"): Stylizacja jak pole Email. Placeholder: "Potwierdź swoje hasło".
        - Obsługa błędów (w tym porównanie z polem Hasło).
    - **Przycisk Główny (Register Button):**
      - Tekst: "Zarejestruj się"
      - Styl: **Solidny przycisk** z kolorem akcentu (fioletowy) jako tłem i białym tekstem. Pełna szerokość kontenera lub dopasowana do treści z odpowiednim paddingiem.
      - Stylizacja spójna z przyciskiem logowania (zaokrąglone rogi, :hover).
    - **Link Logowania (Login Link):**
      - Tekst: "Masz już konto? Zaloguj się" (Already have an account? Login)
      - Umieszczony pod przyciskiem rejestracji.
      - Stylizowany jako tekst z linkiem (np. "Zaloguj się" jako link w kolorze akcentu).

3.  **(Opcjonalnie) Stopka (Footer):**
    - Minimalistyczna stopka z prawami autorskimi, jeśli wymagane.

## Wytyczne Wizualne Dodatkowe

- **Spójność:** Ścisłe przestrzeganie `general-visual-guidelines.md` oraz spójność ze stroną logowania.
- **Minimalizm:** Skupienie na niezbędnych polach i akcjach.
- **Feedback dla Użytkownika:** Jasne wskazanie stanu pól (aktywne, błąd, poprawność), wymagań dotyczących hasła oraz procesu rejestracji.
- **Responsywność:** Zapewnienie poprawnego wyświetlania i działania na różnych urządzeniach.

## Następne Kroki

1.  Implementacja struktury HTML/React/Astro dla formularza.
2.  Styling za pomocą Tailwind CSS zgodnie z planem.
3.  Implementacja logiki walidacji po stronie klienta (wymagania dotyczące hasła, zgodność haseł).
4.  Połączenie z endpointem API rejestracji.
5.  Testowanie funkcjonalne i wizualne.
