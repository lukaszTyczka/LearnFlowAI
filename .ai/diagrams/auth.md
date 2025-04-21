<authentication_analysis>

- Przepływy autentykacji:
  1. Rejestracja: Przeglądarka (React) wysyła dane do backendu Astro. Astro przekazuje je do Supabase Auth, który wysyła link weryfikacyjny na email. Po kliknięciu linku, Przeglądarka wysyła żądanie weryfikacji do Astro, a Astro do Supabase.
  2. Logowanie: Przeglądarka wysyła dane logowania do Astro. Astro komunikuje się z Supabase Auth, który zwraca token sesji. Astro przekazuje token do Przeglądarki (często w formie bezpiecznego ciasteczka HTTPOnly).
  3. Zarządzanie sesją i odświeżanie tokenu: Przeglądarka wysyła żądania do Astro. Astro weryfikuje sesję (np. przez ciasteczko) i w razie potrzeby komunikuje się z Supabase w celu odświeżenia tokenu, zanim przekaże żądanie lub zwróci odpowiedź.
  4. Wylogowanie: Przeglądarka wysyła żądanie wylogowania do Astro. Astro komunikuje się z Supabase, aby unieważnić sesję, a następnie usuwa ciasteczko sesyjne z Przeglądarki.
- Aktorzy:
  • Przeglądarka (aplikacja React działająca w Astro)
  • Astro Backend (działający jako proxy i zarządzający sesją po stronie serwera)
  • Supabase Auth (serwis autentykacji)
  • Email Service (do weryfikacji rejestracji)
  </authentication_analysis>

<mermaid_diagram>

```mermaid
sequenceDiagram
autonumber
participant Browser as "Przeglądarka (React)"
participant Astro as "Astro Backend"
participant Supabase as "Supabase Auth"
participant Email as "Email Service"

Note over Browser,Supabase: Rejestracja i weryfikacja email
Browser->>Astro: Rejestracja (dane użytkownika)
activate Astro
Astro->>Supabase: Przekaż dane rejestracji
activate Supabase
Supabase-->>Email: Wyślij link weryfikacyjny
Supabase-->>Astro: Odpowiedź (np. oczekiwanie na weryfikację)
deactivate Supabase
Astro-->>Browser: Odpowiedź (np. sprawdź email)
deactivate Astro

Email-->>Browser: Dostarczenie linku weryfikacyjnego
Browser->>Astro: Weryfikacja (kliknięcie linku / token z linku)
activate Astro
Astro->>Supabase: Przekaż żądanie weryfikacji
activate Supabase
Supabase-->>Astro: Potwierdzenie weryfikacji
deactivate Supabase
Astro-->>Browser: Potwierdzenie weryfikacji / Zalogowanie
deactivate Astro

Note over Browser,Supabase: Logowanie
Browser->>Astro: Logowanie (credentials)
activate Astro
Astro->>Supabase: Przekaż dane logowania
activate Supabase
alt Logowanie w Supabase udane
    Supabase-->>Astro: Token sesji / Informacje o użytkowniku
    Note over Astro: Astro tworzy sesję serwera, np. ustawia cookie HTTPOnly
    Astro-->>Browser: Sesja utworzona (np. z ciasteczkiem)
else Logowanie w Supabase nieudane
    Supabase-->>Astro: Błąd logowania
    Astro-->>Browser: Komunikat o błędzie
end
deactivate Supabase
deactivate Astro

Note over Browser,Supabase: Zarządzanie sesją i dostęp do zasobów
loop Sesja aktywna
    Browser->>Astro: Żądanie zasobów (z ciasteczkiem sesji)
    activate Astro
    Note over Astro: Weryfikacja sesji serwera (ciasteczko)
    alt Sesja ważna
        Note over Astro,Supabase: Opcjonalnie: Astro komunikuje się z Supabase (np. dla danych)
        Astro->>Supabase: Pobierz dane (z tokenem Supabase jeśli potrzebny)
        activate Supabase
        Supabase-->>Astro: Dane
        deactivate Supabase
        Astro-->>Browser: Dane zasobów
    else Sesja wygasła / nieprawidłowa
        Astro->>Supabase: Odśwież token / sesję Supabase (jeśli możliwe)
        activate Supabase
        alt Odświeżenie udane
            Supabase-->>Astro: Nowy token / sesja
            Note over Astro: Aktualizacja sesji serwera
            Astro-->>Browser: Dane zasobów (po odświeżeniu)
        else Odświeżenie nieudane
            Supabase-->>Astro: Błąd odświeżania
            Astro-->>Browser: Błąd / Przekierowanie do logowania
        end
        deactivate Supabase
    end
    deactivate Astro
end

Note over Browser,Supabase: Wylogowanie
Browser->>Astro: Wylogowanie
activate Astro
Astro->>Supabase: Unieważnij sesję Supabase
activate Supabase
Supabase-->>Astro: Potwierdzenie wylogowania
deactivate Supabase
Note over Astro: Astro usuwa sesję serwera / ciasteczko
Astro-->>Browser: Sesja zakończona / Potwierdzenie wylogowania
deactivate Astro
```

</mermaid_diagram>
