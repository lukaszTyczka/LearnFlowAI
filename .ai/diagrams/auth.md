<authentication_analysis>

- Przepływy autentykacji:
  1. Rejestracja: Przeglądarka wysyła dane do Supabase Auth, który wysyła link weryfikacyjny na email. Po kliknięciu linku konto jest aktywowane.
  2. Logowanie: Przeglądarka wysyła dane logowania, a Supabase Auth zwraca token sesji.
  3. Weryfikacja i odświeżanie tokenu: Token jest używany do dostępu do zasobów, a w przypadku wygaśnięcia następuje jego odświeżenie.
  4. Wylogowanie: Przeglądarka wysyła żądanie wylogowania, co kończy sesję.
- Aktorzy:
  • Przeglądarka (aplikacja React z TypeScript, Tailwind, Shadcn/ui)
  • Supabase Auth (serwis autentykacji i zarządzania sesją)
  • Email Service (opcjonalnie, do weryfikacji rejestracji)
  </authentication_analysis>

<mermaid_diagram>

```mermaid
sequenceDiagram
autonumber
participant Browser as "Przeglądarka (React)"
participant Supabase as "Supabase Auth"
participant Email as "Email Service"

Note over Browser,Supabase: Rejestracja i weryfikacja email
Browser->>Supabase: Rejestracja (dane użytkownika)
activate Supabase
Supabase-->>Email: Wyślij link weryfikacyjny
deactivate Supabase
Email-->>Browser: Dostarczenie linku
Browser->>Supabase: Weryfikacja tokenu
Supabase-->>Browser: Potwierdzenie weryfikacji

Note over Browser,Supabase: Logowanie
Browser->>Supabase: Logowanie (credentials)
alt Logowanie udane
    Supabase-->>Browser: Token sesji
    loop Sesja aktywna
        Browser->>Supabase: Żądanie zasobów (z tokenem)
        alt Token ważny
            Supabase-->>Browser: Dane zasobów
        else Token wygasł
            Browser->>Supabase: Odśwież token
            Supabase-->>Browser: Nowy token
        end
    end
else Logowanie nieudane
    Supabase-->>Browser: Komunikat o błędzie
end

Note over Browser,Supabase: Wylogowanie
Browser->>Supabase: Wylogowanie
Supabase-->>Browser: Sesja zakończona
```

</mermaid_diagram>
