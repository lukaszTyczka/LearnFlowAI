# Dokument wymagań produktu (PRD) - Osobisty Asystent AI do Nauki(LearnFlow AI)

## 1. Przegląd produktu

Osobisty Asystent AI do Nauki to platforma (początkowo webowa lub konsolowa), zaprojektowana jako "drugi mózg" wspomagający proces uczenia się, szczególnie dla programistów. System przyjmuje notatki w formacie tekstowym (.md, .txt, tekst wklejony) oraz fragmenty kodu. Wykorzystując sztuczną inteligencję (za pośrednictwem OpenRouter, zaczynając od modeli klasy `gpt-4o-mini`), platforma automatycznie generuje zwięzłe podsumowania (w formie ciągłego tekstu), kategoryzuje treści do predefiniowanych przez użytkownika grup (używając specyficznych promptów) oraz tworzy zestawy pytań testowych (Q&A) typu ABCD (jednokrotny wybór) w celu weryfikacji i utrwalenia wiedzy. MVP (Minimum Viable Product) skupia się na walidacji podstawowej wartości dla użytkownika-twórcy ("klient zero") w zakresie przetwarzania materiałów i generowania pomocnych wyników. Backend systemu zostanie zaimplementowany w JS/TS. Produkt zawiera podstawowe integracje z Notion (eksport Q&A w formacie CSV) i Todoist (tworzenie zadania z tagiem 'learning'). Kluczowym elementem jest wbudowany mechanizm oceny jakości generowanych przez AI treści oraz przechowywanie notatek, wyników i ocen w prostej bazie danych.

## 2. Problem użytkownika

Programiści i osoby uczące się nowych technologii często borykają się z problemem nadmiaru informacji i trudnościami w ich efektywnym organizowaniu oraz przyswajaniu. Główne wyzwania to:

- Zarządzanie rozproszonymi notatkami tekstowymi i fragmentami kodu pochodzącymi z różnych źródeł.
- Brak czasu na regularne przeglądanie i syntezę zgromadzonych materiałów.
- Trudność w szybkiej ekstrakcji kluczowych informacji z dłuższych tekstów lub bloków kodu.
- Potrzeba aktywnego sprawdzania zrozumienia i zapamiętywania materiału, wykraczająca poza pasywne czytanie.
- Chaos informacyjny utrudniający skoncentrowaną i efektywną naukę.
- Chęć integracji procesu nauki z istniejącymi narzędziami do zarządzania zadaniami (Todoist) i bazami wiedzy (Notion).

Platforma ma na celu rozwiązanie tych problemów poprzez automatyzację procesu organizacji, podsumowywania i generowania testów z materiałów wejściowych, przekształcając pasywne notatki w aktywne narzędzie do nauki.

## 3. Wymagania funkcjonalne

Wymagania dla MVP:

- FR-001: Możliwość wprowadzania danych tekstowych poprzez wklejenie tekstu bezpośrednio do interfejsu.
- FR-002: Możliwość wprowadzania danych poprzez upload plików tekstowych w formacie .md.
- FR-003: Możliwość wprowadzania danych poprzez upload plików tekstowych w formacie .txt.
- FR-004: Możliwość wprowadzania fragmentów kodu jako danych wejściowych.
- FR-005: Integracja z API modeli językowych AI poprzez platformę OpenRouter.
- FR-006: Możliwość konfiguracji klucza API OpenRouter w systemie.
- FR-007: Wykorzystanie modelu AI klasy `gpt-4o-mini` (lub podobnego) jako domyślnego do generowania wyników.
- FR-008: Możliwość łatwej zmiany modelu AI używanego przez OpenRouter w konfiguracji systemu (na potrzeby testów).
- FR-009: Implementacja mechanizmu wykorzystującego specyficzne prompty do kierowania zadaniami AI (podsumowanie, kategoryzacja, Q&A).
- FR-010: Generowanie jednego, standardowego podsumowania dla wprowadzonego materiału w formacie ciągłego tekstu.
- FR-011: Możliwość predefiniowania przez użytkownika nazw kategorii (grup) do nauki.
- FR-012: Automatyczna kategoryzacja wprowadzonej treści do jednej z predefiniowanych przez użytkownika grup na podstawie analizy AI.
- FR-013: Generowanie zestawu pytań testowych typu ABCD (pytanie + 4 odpowiedzi, jedna poprawna) na podstawie wprowadzonego materiału.
- FR-014: Wyświetlanie wygenerowanego podsumowania, przypisanej kategorii i zestawu Q&A w prostym interfejsie użytkownika (webowym lub konsolowym).
- FR-015: Implementacja mechanizmu oceny (np. skala 1-5 gwiazdek lub kciuki góra/dół) dla jakości wygenerowanego podsumowania.
- FR-016: Implementacja mechanizmu oceny dla trafności przypisanej kategorii.
- FR-017: Implementacja mechanizmu oceny dla jakości wygenerowanych pytań Q&A.
- FR-018: Stworzenie prostej bazy danych do przechowywania danych.
- FR-019: Przechowywanie oryginalnej treści notatki/kodu w bazie danych.
- FR-020: Przechowywanie wygenerowanego podsumowania w bazie danych, powiązanego z oryginalną notatką.
- FR-021: Przechowywanie przypisanej kategorii w bazie danych, powiązanej z oryginalną notatką.
- FR-022: Przechowywanie wygenerowanego zestawu Q&A w bazie danych, powiązanego z oryginalną notatką.
- FR-023: Przechowywanie ocen użytkownika (dla podsumowania, kategorii, Q&A) w bazie danych, powiązanych z odpowiednimi wynikami.
- FR-024: Funkcja eksportu wygenerowanego zestawu Q&A do pliku w formacie CSV, kompatybilnego z importem do Notion (dokładna struktura kolumn zostanie zdefiniowana podczas implementacji).
- FR-025: Opcjonalna integracja z API Todoist.
- FR-026: Możliwość konfiguracji klucza API Todoist w systemie.
- FR-027: Automatyczne tworzenie zadania w Todoist z tagiem `learning` po przetworzeniu materiału (jeśli integracja jest skonfigurowana).
- FR-028: Implementacja logiki backendowej aplikacji w języku JavaScript lub TypeScript.
- FR-029: Podstawowy mechanizm uwierzytelniania użytkownika (nawet jeśli tylko dla jednego użytkownika w MVP).

## 4. Granice produktu

Następujące funkcje i formaty są wyraźnie wyłączone z zakresu MVP:

- Obsługa formatów wejściowych: .docx, .pdf, obrazy (OCR).
- Funkcja łączenia lub scalania wielu notatek.
- Konfigurowalne typy lub długości podsumowań.
- Wykorzystanie baz wektorowych do zaawansowanego wyszukiwania lub porównywania notatek.
- Generowanie innych typów pytań Q&A niż ABCD (np. pytania otwarte, prawda/fałsz, uzupełnianie luk).
- Możliwość bezpośredniego importu pytań Q&A z zewnętrznych formatów (np. CSV, JSON).
- Funkcjonalność chatbota do interaktywnej rozmowy o materiale.
- Zaawansowane integracje z Todoist (np. wybór projektu, ustawianie daty ważności).
- Zaawansowane integracje z Notion (np. tworzenie stron, różne formaty eksportu inne niż wstępnie ustalony CSV).
- Jakakolwiek forma monetyzacji.
- Rozbudowany lub wysoce stylizowany interfejs użytkownika.
- Generowanie plików audio z notatek lub podsumowań.

## 5. Historyjki użytkowników

- ID: US-001
- Tytuł: Wprowadzanie tekstu przez wklejenie
- Opis: Jako użytkownik, chcę móc wkleić skopiowany tekst (np. z artykułu, dokumentacji) do aplikacji, aby system mógł go przetworzyć.
- Kryteria akceptacji:

  - W interfejsie istnieje pole tekstowe (textarea) do wklejania treści.
  - System poprawnie przyjmuje wklejony tekst.
  - System inicjuje przetwarzanie wklejonego tekstu po akcji użytkownika (np. kliknięciu przycisku "Przetwórz").

- ID: US-002
- Tytuł: Wprowadzanie tekstu z pliku .md
- Opis: Jako użytkownik, chcę móc załadować plik w formacie Markdown (.md) zawierający moje notatki, aby system mógł go przetworzyć.
- Kryteria akceptacji:

  - W interfejsie istnieje przycisk/mechanizm do wyboru pliku z dysku.
  - System akceptuje pliki z rozszerzeniem .md.
  - System poprawnie odczytuje zawartość pliku .md.
  - System inicjuje przetwarzanie treści pliku po jego załadowaniu i akcji użytkownika.

- ID: US-003
- Tytuł: Wprowadzanie tekstu z pliku .txt
- Opis: Jako użytkownik, chcę móc załadować plik w formacie tekstowym (.txt) zawierający moje notatki, aby system mógł go przetworzyć.
- Kryteria akceptacji:

  - W interfejsie istnieje przycisk/mechanizm do wyboru pliku z dysku.
  - System akceptuje pliki z rozszerzeniem .txt.
  - System poprawnie odczytuje zawartość pliku .txt.
  - System inicjuje przetwarzanie treści pliku po jego załadowaniu i akcji użytkownika.

- ID: US-004
- Tytuł: Wprowadzanie fragmentu kodu
- Opis: Jako użytkownik, chcę móc wkleić lub załadować fragment kodu (np. C#, JS, Python), aby system mógł go przetworzyć (wygenerować podsumowanie, Q&A).
- Kryteria akceptacji:

  - System poprawnie przyjmuje fragment kodu jako tekst wejściowy (przez wklejenie lub z pliku tekstowego).
  - System przekazuje kod do AI w celu przetworzenia.
  - System jest w stanie wygenerować podsumowanie, kategorię i Q&A dla fragmentu kodu.

- ID: US-005
- Tytuł: Definiowanie kategorii nauki
- Opis: Jako użytkownik, chcę móc zdefiniować listę własnych kategorii (np. "C#", "Wzorce Projektowe", "Algorytmy"), aby system mógł automatycznie przypisywać przetwarzane notatki do jednej z nich.
- Kryteria akceptacji:

  - W interfejsie (lub pliku konfiguracyjnym) istnieje miejsce do zarządzania listą kategorii (dodawanie, usuwanie, edycja nazw).
  - Zdefiniowane kategorie są przechowywane przez system.
  - System wykorzystuje tę listę podczas procesu kategoryzacji przez AI.

- ID: US-006
- Tytuł: Generowanie podsumowania, kategorii i Q&A
- Opis: Jako użytkownik, po wprowadzeniu tekstu lub kodu, chcę otrzymać automatycznie wygenerowane podsumowanie, przypisanie do jednej z moich predefiniowanych kategorii oraz zestaw pytań ABCD, aby wspomóc proces nauki.
- Kryteria akceptacji:

  - Po wprowadzeniu danych i zainicjowaniu przetwarzania, system wysyła dane i odpowiednie prompty do API AI (przez OpenRouter).
  - System odbiera wyniki z API AI.
  - System wyświetla wygenerowane podsumowanie (jako ciągły tekst).
  - System wyświetla nazwę przypisanej kategorii (z predefiniowanej listy).
  - System wyświetla wygenerowany zestaw pytań w formacie ABCD (pytanie, 4 odpowiedzi).
  - Wyniki (oryginalna notatka, podsumowanie, kategoria, Q&A) są zapisywane w bazie danych.

- ID: US-007
- Tytuł: Ocena jakości wyników AI
- Opis: Jako użytkownik, chcę móc ocenić jakość (np. w skali 1-5 lub kciukami) każdego wygenerowanego podsumowania, przypisanej kategorii i zestawu Q&A, aby móc śledzić skuteczność AI i dostarczać informacji zwrotnej.
- Kryteria akceptacji:

  - Przy każdym wygenerowanym wyniku (podsumowanie, kategoria, Q&A) widoczne są kontrolki do oceny (np. gwiazdki, przyciski kciuków).
  - Po wybraniu oceny przez użytkownika, jest ona zapisywana w bazie danych w powiązaniu z odpowiednim wynikiem i oryginalną notatką.
  - Użytkownik może zmienić swoją ocenę.

- ID: US-008
- Tytuł: Przeglądanie historii przetworzonych notatek i ocen
- Opis: Jako użytkownik, chcę mieć możliwość przeglądania historii przetworzonych notatek wraz z wygenerowanymi przez AI wynikami (podsumowanie, kategoria, Q&A) oraz moimi ocenami, aby móc wrócić do materiału i zweryfikować postępy.
- Kryteria akceptacji:

  - Istnieje interfejs (lub sposób dostępu do bazy danych) pozwalający na listowanie historycznych wpisów.
  - Dla każdego wpisu widoczna jest oryginalna notatka, wygenerowane podsumowanie, kategoria, Q&A oraz zapisana ocena użytkownika.
  - Możliwe jest filtrowanie lub sortowanie wpisów (opcjonalnie, minimum to listowanie).

- ID: US-009
- Tytuł: Eksport Q&A do Notion
- Opis: Jako użytkownik Notion, chcę móc wyeksportować wygenerowane pytania Q&A dla danej notatki do pliku CSV, który mogę łatwo zaimportować do Notion (np. jako bazę danych lub toggle list) w celu stworzenia fiszek.
- Kryteria akceptacji:

  - Przy wygenerowanym zestawie Q&A dostępna jest opcja "Eksportuj do CSV dla Notion".
  - Po kliknięciu opcji system generuje plik CSV zawierający pytania i odpowiedzi.
  - Format pliku CSV jest zdefiniowany (nawet jeśli wstępnie, np. kolumna 'Pytanie', kolumna 'Odpowiedź Poprawna', kolumny 'Odpowiedź Błędna 1-3') i umożliwia import do Notion.
  - Użytkownik może pobrać wygenerowany plik CSV.

- ID: US-010
- Tytuł: Konfiguracja integracji z Todoist
- Opis: Jako użytkownik Todoist, chcę móc skonfigurować integrację z moim kontem poprzez podanie klucza API, aby system mógł automatycznie tworzyć zadania.
- Kryteria akceptacji:

  - W ustawieniach aplikacji istnieje pole do wprowadzenia klucza API Todoist.
  - Klucz API jest bezpiecznie przechowywany (przynajmniej na poziomie MVP).
  - Istnieje opcja włączenia/wyłączenia automatycznego tworzenia zadań w Todoist.

- ID: US-011
- Tytuł: Automatyczne tworzenie zadania w Todoist
- Opis: Jako użytkownik Todoist (z aktywną integracją), chcę, aby po przetworzeniu nowej notatki system automatycznie utworzył zadanie w mojej skrzynce odbiorczej Todoist z tagiem `learning`, przypominające mi o powrocie do tego materiału.
- Kryteria akceptacji:

  - Jeśli integracja z Todoist jest włączona i poprawnie skonfigurowana, po pomyślnym przetworzeniu notatki system wysyła żądanie do API Todoist.
  - W skrzynce odbiorczej Todoist pojawia się nowe zadanie.
  - Zadanie zawiera identyfikator lub tytuł notatki.
  - Zadanie ma przypisany tag `learning`.
  - Zadanie nie jest przypisane do konkretnego projektu (trafia do Inbox).

- ID: US-012
- Tytuł: Uwierzytelnienie użytkownika
- Opis: Jako użytkownik, chcę móc się zalogować do aplikacji, aby mieć dostęp do moich notatek, kategorii i ustawień.
- Kryteria akceptacji:

  - Aplikacja prezentuje formularz logowania (np. użytkownik/hasło).
  - System weryfikuje poświadczenia użytkownika (nawet jeśli jest tylko jeden predefiniowany użytkownik dla MVP).
  - Po poprawnym zalogowaniu użytkownik uzyskuje dostęp do funkcjonalności aplikacji.
  - Dostęp do funkcji (przetwarzanie, przeglądanie historii, ustawienia) jest ograniczony dla niezalogowanych użytkowników.

- ID: US-013
- Tytuł: Konfiguracja klucza API OpenRouter
- Opis: Jako użytkownik, chcę móc skonfigurować klucz API dla OpenRouter, aby aplikacja mogła korzystać z modeli AI za jego pośrednictwem i aby koszty były powiązane z moim kontem.
- Kryteria akceptacji:
  - W ustawieniach aplikacji istnieje pole do wprowadzenia klucza API OpenRouter.
  - Klucz API jest bezpiecznie przechowywany.
  - Aplikacja wykorzystuje podany klucz do komunikacji z API OpenRouter.

## 6. Metryki sukcesu

Sukces MVP zostanie oceniony na podstawie następujących kryteriów:

- MS-001: Poprawność Funkcjonalności Rdzenia: Podstawowe funkcje (przyjmowanie tekstu/kodu, generowanie podsumowania, kategoryzacja, generowanie Q&A ABCD) działają zgodnie z oczekiwaniami w >90% przypadków testowych przeprowadzonych przez użytkownika-twórcę.
- MS-002: Subiektywna Wartość dla Użytkownika: Generowane przez AI wyniki (podsumowania, kategorie, Q&A) są oceniane jako "pomocne" lub "bardzo pomocne" (np. 4/5 gwiazdek lub kciuk w górę) przez użytkownika-twórcę w >75% przetworzonych notatek, co jest mierzone za pomocą wbudowanego systemu ocen.
- MS-003: Poprawność Integracji: Funkcja eksportu Q&A generuje plik CSV możliwy do zaimportowania w Notion. Jeśli integracja z Todoist jest skonfigurowana, zadania są poprawnie tworzone w Todoist z tagiem `learning` dla każdej przetworzonej notatki. Weryfikowane manualnie przez użytkownika-twórcę.
- MS-004: Kontrola Budżetu: Miesięczne koszty wykorzystania API AI przez OpenRouter nie przekraczają ustalonego budżetu 100 zł. Monitorowane za pomocą panelu OpenRouter.
- MS-005: Elastyczność Modeli AI: Istnieje możliwość skutecznego przełączania i testowania różnych modeli AI dostępnych przez OpenRouter dla zadań generowania, co jest weryfikowane przez użytkownika-twórcę.
- MS-006: Zaangażowanie Użytkownika-Twórcy: Narzędzie jest regularnie używane w procesie nauki przez jego twórcę (co najmniej 3-4 razy w tygodniu). Mierzone przez samoocenę lub dziennik użytkowania.
- MS-007: Poprawność Persystencji Danych: Wszystkie kluczowe dane (oryginalne notatki, wygenerowane wyniki AI, oceny użytkownika) są poprawnie zapisywane w bazie danych i mogą być odczytane/wyświetlone w interfejsie historii. Weryfikowane przez testy CRUD i przeglądanie historii.
- MS-008: Realizacja Celu Nauki Technologii: Backend aplikacji został pomyślnie zaimplementowany w JS/TS, co potwierdza osiągnięcie celu nauki tej technologii przez twórcę. Mierzone przez ukończenie funkcjonalności MVP i samoocenę postępów w nauce JS/TS.
