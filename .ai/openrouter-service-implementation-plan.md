# Przewodnik Implementacji Usługi OpenRouter dla LearnFlowAI

Ten dokument opisuje plan wdrożenia usługi `OpenRouterService`, która będzie odpowiedzialna za interakcję z API OpenRouter w celu obsługi funkcji opartych na LLM w aplikacji LearnFlowAI.

## 1. Opis Usługi

`OpenRouterService` będzie hermetyzować logikę komunikacji z API OpenRouter (`https://openrouter.ai/api/v1/chat/completions`). Jej głównym zadaniem jest wysyłanie żądań do modeli językowych (LLM) hostowanych na OpenRouter, zarządzanie konfiguracją (klucz API, domyślny model), formatowanie żądań (wiadomości systemowe, użytkownika, parametry), obsługa odpowiedzi (w tym odpowiedzi strukturalnych w formacie JSON) oraz zarządzanie błędami. Usługa będzie działać po stronie serwera w środowisku Astro (np. w endpointach API w `src/pages/api/`).

## 2. Opis Konstruktora

Konstruktor `OpenRouterService` będzie odpowiedzialny za inicjalizację usługi.

```typescript
// Potencjalna lokalizacja: src/lib/api/openrouter/OpenRouterService.ts

interface OpenRouterServiceConfig {
  apiKey?: string; // Opcjonalnie, może być ładowany bezpośrednio ze zmiennych środowiskowych
  defaultModel?: string;
  baseURL?: string;
}

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly defaultModel: string;
  private readonly baseURL: string;

  constructor(config: OpenRouterServiceConfig = {}) {
    // 1. Wczytaj klucz API: Priorytet dla config.apiKey, fallback na zmienną środowiskową
    this.apiKey = config.apiKey || import.meta.env.OPENROUTER_API_KEY;
    if (!this.apiKey) {
      console.error(
        "OpenRouter API Key is missing. Please set OPENROUTER_API_KEY environment variable."
      );
      throw new Error("OpenRouter API Key is not configured.");
    }

    // 2. Ustaw domyślny model: Priorytet dla config.defaultModel, fallback na stałą lub inną zmienną
    this.defaultModel = config.defaultModel || "openai/gpt-4o-mini"; // Przykładowy domyślny model

    // 3. Ustaw bazowy URL API: Priorytet dla config.baseURL, fallback na oficjalny URL
    this.baseURL = config.baseURL || "https://openrouter.ai/api/v1";

    // Opcjonalnie: Inicjalizacja klienta HTTP (np. jeśli używamy axios)
  }

  // ... reszta metod
}
```

**Kluczowe zadania konstruktora:**

1.  **Wczytanie Klucza API:** Bezpieczne pobranie klucza API OpenRouter ze zmiennych środowiskowych (`.env`). Rzucenie błędu, jeśli klucz nie jest dostępny.
2.  **Ustawienie Domyślnego Modelu:** Ustalenie domyślnego modelu LLM do użycia, jeśli nie zostanie podany jawnie w żądaniu.
3.  **Ustawienie Bazowego URL:** Skonfigurowanie adresu URL API OpenRouter.

## 3. Publiczne Metody i Pola

```typescript
import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema"; // Wymagana instalacja: npm install zod-to-json-schema

// Typy dla wiadomości i odpowiedzi
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionParams {
  model?: string; // Opcjonalnie, użyje domyślnego, jeśli nie podano
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  response_format?:
    | {
        type: "json_schema";
        json_schema: {
          name: string;
          strict?: boolean;
          description?: string;
          schema: object; // JSON Schema object
        };
      }
    | { type: "text" }; // OpenRouter obsługuje też 'text' jako domyślny
  stream?: boolean; // Czy odpowiedź ma być strumieniowana (niezaimplementowane w tym planie)
  // inne parametry OpenRouter...
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  // ... inne pola odpowiedzi
}

// Potencjalny interfejs dla odpowiedzi ze schematem JSON
export interface StructuredChatCompletionResponse<T>
  extends Omit<ChatCompletionResponse, "choices"> {
  choices: Array<{
    index: number;
    message: {
      role: "assistant";
      content: null; // W trybie JSON content może być null
      tool_calls: Array<{
        // OpenRouter może używać tool_calls do zwracania JSON
        id: string;
        type: "function";
        function: {
          name: string; // Nazwa schematu podana w response_format
          arguments: string; // JSON jako string
        };
      }>;
    };
    finish_reason: string;
  }>;
  // Metoda pomocnicza do parsowania JSON
  getParsedJsonPayload: () => T | null;
}

export class OpenRouterService {
  // ... konstruktor i pola prywatne ...

  /**
   * Wysyła żądanie ukończenia czatu do API OpenRouter.
   * @param params Parametry żądania, w tym model, wiadomości i opcjonalne parametry LLM.
   * @returns Obietnica z odpowiedzią API OpenRouter.
   */
  public async createChatCompletion(
    params: ChatCompletionParams
  ): Promise<ChatCompletionResponse> {
    // Implementacja w sekcji "Plan wdrożenia krok po kroku"
    throw new Error("Not implemented");
  }

  /**
   * Wysyła żądanie ukończenia czatu z oczekiwaniem na odpowiedź w formacie JSON zgodnym z podanym schematem Zod.
   * @param params Parametry żądania.
   * @param zodSchema Schemat Zod definiujący oczekiwany format JSON.
   * @param schemaName Nazwa funkcji/schematu do użycia w response_format.
   * @param strict Czy schemat ma być ściśle przestrzegany.
   * @returns Obietnica z przetworzoną odpowiedzią zawierającą sparsowany obiekt JSON.
   */
  public async createStructuredChatCompletion<T>(
    params: Omit<ChatCompletionParams, "response_format">,
    zodSchema: z.ZodType<T>,
    schemaName: string,
    strict: boolean = true
  ): Promise<StructuredChatCompletionResponse<T>> {
    // Implementacja w sekcji "Plan wdrożenia krok po kroku"
    throw new Error("Not implemented");
  }

  // Ewentualne inne metody publiczne (np. do listowania modeli)
}
```

**Kluczowe Metody Publiczne:**

1.  `createChatCompletion(params: ChatCompletionParams)`: Główna metoda do wysyłania standardowych żądań czatu. Przyjmuje obiekt `ChatCompletionParams` zawierający m.in. listę wiadomości (`messages`), nazwę modelu i opcjonalne parametry. Zwraca surową odpowiedź z API.
2.  `createStructuredChatCompletion<T>(params: Omit<ChatCompletionParams, 'response_format'>, zodSchema: z.ZodType<T>, schemaName: string, strict?: boolean)`: Metoda specjalizowana do żądań oczekujących odpowiedzi w formacie JSON. Przyjmuje standardowe parametry oraz schemat Zod (`zodSchema`) i nazwę dla `response_format`. Automatycznie konfiguruje `response_format` i próbuje sparsować zwrócony JSON zgodnie ze schematem. Zwraca obiekt odpowiedzi wzbogacony o sparsowany payload.

## 4. Prywatne Metody i Pola

```typescript
import { ZodError } from "zod"; // Potrzebne do obsługi błędów walidacji

// Definicje niestandardowych błędów
export class OpenRouterApiError extends Error {
  constructor(message: string, public status?: number, public details?: any) {
    super(message);
    this.name = "OpenRouterApiError";
  }
}

export class NetworkError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = "NetworkError";
  }
}

export class JsonParsingError extends Error {
  constructor(
    message: string,
    public rawContent?: string,
    public cause?: Error
  ) {
    super(message);
    this.name = "JsonParsingError";
  }
}

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly defaultModel: string;
  private readonly baseURL: string;

  // ... konstruktor i metody publiczne ...

  /**
   * Prywatna metoda do wykonywania żądań HTTP do API OpenRouter.
   * Obsługuje dodawanie nagłówków autoryzacyjnych i formatowanie ciała żądania.
   * @param endpoint Ścieżka API (np. '/chat/completions').
   * @param body Ciało żądania.
   * @returns Obietnica z odpowiedzią fetch API.
   */
  private async _request(
    endpoint: string,
    body: Record<string, any>
  ): Promise<Response> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      // OpenRouter zaleca dodanie nagłówka HTTP-Referer lub X-Title
      "HTTP-Referer": "https://learnflowai.com", // Zmień na swój URL
      "X-Title": "LearnFlowAI", // Zmień na nazwę swojej aplikacji
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      });
      return response;
    } catch (error: any) {
      // Błąd sieciowy (np. brak połączenia)
      console.error(
        `Network error calling OpenRouter API: ${error.message}`,
        error
      );
      throw new NetworkError(
        `Failed to connect to OpenRouter API: ${error.message}`,
        error
      );
    }
  }

  /**
   * Przetwarza odpowiedź z API, obsługując statusy błędów HTTP.
   * @param response Odpowiedź fetch API.
   * @returns Parsowana odpowiedź JSON lub rzuca błąd.
   */
  private async _handleResponse<T>(response: Response): Promise<T> {
    let responseBody;
    try {
      // Spróbuj odczytać ciało odpowiedzi, nawet jeśli jest błąd, może zawierać szczegóły
      responseBody = await response.json();
    } catch (e) {
      // Jeśli parsowanie JSON zawiedzie, spróbuj odczytać jako tekst
      try {
        const textBody = await response.text();
        console.error(
          `Failed to parse JSON response from OpenRouter. Status: ${response.status}. Body: ${textBody}`
        );
        throw new JsonParsingError(
          `Failed to parse JSON response. Status: ${response.status}`,
          textBody,
          e instanceof Error ? e : undefined
        );
      } catch (textError) {
        console.error(
          `Failed to parse JSON and text response from OpenRouter. Status: ${response.status}.`
        );
        throw new Error(
          `Received non-JSON, non-text response from OpenRouter. Status: ${response.status}`
        );
      }
    }

    if (!response.ok) {
      const errorMessage = `OpenRouter API Error: ${response.status} ${response.statusText}`;
      const errorDetails = responseBody?.error || responseBody; // OpenRouter często zwraca błędy w polu 'error'
      console.error(errorMessage, errorDetails);
      // TODO: Dodać obsługę Rate Limiting (429) z Retry-After
      throw new OpenRouterApiError(errorMessage, response.status, errorDetails);
    }

    return responseBody as T;
  }

  /**
   * Parsuje i waliduje argumenty funkcji/narzędzia z odpowiedzi strukturalnej.
   * @param response Odpowiedź z API.
   * @param zodSchema Schemat Zod do walidacji.
   * @returns Sparsowany i zwalidowany obiekt lub rzuca błąd.
   */
  private _parseAndValidateJsonResponse<T>(
    response: StructuredChatCompletionResponse<any>, // Używamy any, bo T jest nieznane na tym etapie
    zodSchema: z.ZodType<T>,
    schemaName: string
  ): T {
    const toolCall = response.choices?.[0]?.message?.tool_calls?.find(
      (call) => call.type === "function" && call.function.name === schemaName
    );

    if (!toolCall?.function?.arguments) {
      console.error(
        "No matching tool call found in OpenRouter response for schema:",
        schemaName,
        response
      );
      throw new JsonParsingError(
        "Structured JSON response is missing the expected tool call or arguments."
      );
    }

    let parsedArgs: any;
    try {
      parsedArgs = JSON.parse(toolCall.function.arguments);
    } catch (e) {
      console.error(
        "Failed to parse JSON arguments from tool call:",
        toolCall.function.arguments,
        e
      );
      throw new JsonParsingError(
        "Failed to parse JSON arguments from structured response.",
        toolCall.function.arguments,
        e instanceof Error ? e : undefined
      );
    }

    try {
      // Walidacja sparsowanych argumentów za pomocą schematu Zod
      const validatedData = zodSchema.parse(parsedArgs);
      return validatedData;
    } catch (error) {
      if (error instanceof ZodError) {
        console.error(
          "Zod validation failed for structured response:",
          error.errors
        );
        throw new JsonParsingError(
          `Validation failed for structured response (schema: ${schemaName}): ${error.message}`,
          JSON.stringify(parsedArgs), // Dodajemy sparsowane, ale nieudane dane
          error
        );
      }
      console.error("Unexpected error during Zod validation:", error);
      throw error; // Rzuć nieoczekiwany błąd dalej
    }
  }
}
```

**Kluczowe Metody/Pola Prywatne:**

1.  `apiKey`, `defaultModel`, `baseURL`: Przechowują konfigurację wczytaną w konstruktorze.
2.  `_request(endpoint, body)`: Prywatna metoda do wysyłania żądań `fetch`. Odpowiada za ustawienie odpowiednich nagłówków (w tym `Authorization` z kluczem API, `Content-Type`, `HTTP-Referer`, `X-Title`) i wysłanie żądania POST z ciałem JSON. Obsługuje podstawowe błędy sieciowe.
3.  `_handleResponse<T>(response)`: Przetwarza obiekt `Response` z `fetch`. Sprawdza `response.ok`. Jeśli wystąpił błąd HTTP (status 4xx lub 5xx), próbuje sparsować ciało odpowiedzi (które może zawierać szczegóły błędu od OpenRouter), loguje błąd i rzuca niestandardowy `OpenRouterApiError`. W przypadku sukcesu (status 2xx), parsuje ciało odpowiedzi jako JSON i zwraca je. Obsługuje również błędy parsowania JSON.
4.  `_parseAndValidateJsonResponse<T>(response, zodSchema, schemaName)`: Metoda pomocnicza używana przez `createStructuredChatCompletion`. Wyodrębnia odpowiedni `tool_call` z odpowiedzi API, parsuje string JSON z `arguments` i waliduje go za pomocą dostarczonego schematu `zodSchema`. Rzuca `JsonParsingError` w przypadku niepowodzenia parsowania lub walidacji Zod.

## 5. Obsługa Błędów

Usługa będzie implementować następujące strategie obsługi błędów:

1.  **Błędy Konfiguracji:** Konstruktor sprawdzi obecność klucza API i rzuci standardowy błąd (`Error`), jeśli go brakuje, uniemożliwiając utworzenie instancji usługi bez klucza.
2.  **Błędy Sieciowe:** Metoda `_request` opakuje wywołanie `fetch` w blok `try...catch` i rzuci niestandardowy `NetworkError` w przypadku problemów z połączeniem (np. DNS, timeout).
3.  **Błędy API OpenRouter (HTTP 4xx/5xx):** Metoda `_handleResponse` wykryje błędy na podstawie statusu HTTP. Sparsuje ciało odpowiedzi w poszukiwaniu szczegółów błędu i rzuci `OpenRouterApiError` zawierający status HTTP i (jeśli dostępne) szczegóły błędu zwrócone przez API.
    - **401 Unauthorized:** Wskazuje na nieprawidłowy klucz API. Błąd powinien być logowany jako krytyczny.
    - **429 Too Many Requests:** Wskazuje na przekroczenie limitu zapytań. W przyszłości można dodać logikę ponowienia próby (retry) z wykorzystaniem mechanizmu _exponential backoff_, respektując nagłówek `Retry-After`, jeśli jest obecny. Początkowo będzie traktowany jak inne błędy API.
    - **400 Bad Request:** Zazwyczaj oznacza błąd w formacie wysłanego żądania (np. nieprawidłowy JSON, nieznany parametr, błąd w `response_format`). Błąd powinien być logowany ze szczegółami, aby ułatwić debugowanie po stronie klienta (czyli naszej usługi).
    - **5xx Server Error:** Błędy po stronie OpenRouter. Można rozważyć mechanizm ponowienia próby (retry).
4.  **Błędy Parsowania Odpowiedzi:**
    - Metoda `_handleResponse` obsłuży sytuacje, gdy odpowiedź API nie jest prawidłowym JSON-em, rzucając `JsonParsingError`.
    - Metoda `_parseAndValidateJsonResponse` obsłuży błędy podczas parsowania stringu JSON z `tool_calls.function.arguments` oraz błędy walidacji Zod (`ZodError`), rzucając odpowiedni `JsonParsingError`.
5.  **Logowanie:** Wszystkie istotne błędy (konfiguracji, sieciowe, API, parsowania) będą logowane po stronie serwera (np. za pomocą `console.error` lub dedykowanego loggera) z odpowiednim kontekstem, aby ułatwić diagnozę.

## 6. Kwestie Bezpieczeństwa

1.  **Klucz API:** Klucz API OpenRouter jest wrażliwym danym. **Nigdy** nie powinien być umieszczany bezpośrednio w kodzie źródłowym ani w repozytorium Git. Należy go przechowywać wyłącznie w zmiennych środowiskowych (`.env` dla lokalnego rozwoju, sekrety w środowisku produkcyjnym/CI/CD). Plik `.env` musi być dodany do `.gitignore`.
2.  **Walidacja Danych Wejściowych:** Chociaż usługa działa po stronie serwera, wszelkie dane pochodzące od użytkownika (np. treść wiadomości do LLM) powinny być traktowane jako potencjalnie niebezpieczne. Należy unikać wstrzykiwania nieoczyszczonych danych użytkownika do promptów w sposób, który mógłby prowadzić do _prompt injection_. Należy stosować odpowiednie oczyszczanie lub kodowanie, jeśli dane użytkownika są używane w strukturze promptu (poza samą treścią wiadomości `user`).
3.  **Ograniczenie Dostępu:** Endpointy API Astro (`src/pages/api/ai/*`), które będą korzystać z `OpenRouterService`, muszą być odpowiednio zabezpieczone, np. wymagać uwierzytelnienia użytkownika, aby nieuprawnione osoby nie mogły generować kosztownych zapytań do API OpenRouter. Należy użyć middleware Astro do ochrony tych endpointów.
4.  **Zarządzanie Kosztami:** Należy monitorować użycie API OpenRouter i rozważyć wprowadzenie limitów po stronie aplikacji (np. maksymalna liczba zapytań na użytkownika na dzień) lub wykorzystanie funkcji limitów budżetowych oferowanych przez OpenRouter, aby uniknąć niekontrolowanych kosztów.
5.  **Logowanie Danych Wrażliwych:** Należy uważać, aby nie logować pełnych treści wiadomości użytkownika lub odpowiedzi LLM, jeśli zawierają one dane wrażliwe, chyba że jest to absolutnie konieczne do debugowania i jest zgodne z polityką prywatności. Klucze API nigdy nie powinny pojawiać się w logach.

## 7. Plan Wdrożenia Krok po Kroku

1.  **Utworzenie Struktury Plików:**

    - Utwórz katalog: `src/lib/api/openrouter/`
    - Utwórz plik: `src/lib/api/openrouter/OpenRouterService.ts`
    - Utwórz plik (opcjonalnie, dla typów): `src/lib/api/openrouter/types.ts` (lub zdefiniuj typy w `OpenRouterService.ts`)
    - Utwórz plik (opcjonalnie, dla błędów): `src/lib/api/openrouter/errors.ts` (lub zdefiniuj błędy w `OpenRouterService.ts`)

2.  **Instalacja Zależności:**

    - Jeśli planujesz używać Zod do schematów JSON: `npm install zod`
    - Do konwersji schematów Zod na JSON Schema dla `response_format`: `npm install zod-to-json-schema`

3.  **Konfiguracja Zmiennych Środowiskowych:**

    - Dodaj `OPENROUTER_API_KEY=twoj_klucz_api` do pliku `.env`.
    - Upewnij się, że `.env` jest w `.gitignore`.
    - Dodaj `OPENROUTER_API_KEY` do pliku `.env.example` bez wartości (np. `OPENROUTER_API_KEY=`).
    - Zaktualizuj `src/env.d.ts`, aby TypeScript rozpoznawał `import.meta.env.OPENROUTER_API_KEY`:

      ```typescript
      // src/env.d.ts
      /// <reference types="astro/client" />

      interface ImportMetaEnv {
        readonly OPENROUTER_API_KEY: string;
        // Inne zmienne środowiskowe...
      }

      interface ImportMeta {
        readonly env: ImportMetaEnv;
      }
      ```

4.  **Implementacja Klasy `OpenRouterService`:**

    - W pliku `src/lib/api/openrouter/OpenRouterService.ts` zaimplementuj klasę `OpenRouterService` zgodnie z opisem w sekcjach 2, 3 i 4.
    - Zdefiniuj potrzebne interfejsy (`ChatMessage`, `ChatCompletionParams`, `ChatCompletionResponse`, `StructuredChatCompletionResponse`) i niestandardowe błędy (`OpenRouterApiError`, `NetworkError`, `JsonParsingError`).
    - Implementacja **Konstruktora:** Wczytaj `apiKey`, `defaultModel`, `baseURL` zgodnie z opisem.
    - Implementacja **`_request`:** Użyj globalnego `fetch` (dostępnego w Astro/Node), ustaw nagłówki (`Authorization`, `Content-Type`, `HTTP-Referer`, `X-Title`), wykonaj żądanie POST, obsłuż błędy sieciowe (`NetworkError`).
    - Implementacja **`_handleResponse`:** Sprawdź `response.ok`, sparsuj JSON, obsłuż błędy HTTP (`OpenRouterApiError`), obsłuż błędy parsowania JSON (`JsonParsingError`).
    - Implementacja **`createChatCompletion`:**
      - Przygotuj ciało żądania (`body`) na podstawie `params`, używając `params.model` lub `this.defaultModel`.
      - Wywołaj `await this._request('/chat/completions', body)`.
      - Wywołaj `await this._handleResponse<ChatCompletionResponse>(response)`.
      - Zwróć wynik.
    - Implementacja **`_parseAndValidateJsonResponse`:**
      - Znajdź odpowiedni `tool_call` w odpowiedzi.
      - Sparsuj `arguments` jako JSON.
      - Użyj `zodSchema.parse()` do walidacji.
      - Obsłuż błędy parsowania i walidacji (`JsonParsingError`, `ZodError`).
      - Zwróć zwalidowane dane.
    - Implementacja **`createStructuredChatCompletion`:**
      - Przygotuj `json_schema` używając `zodToJsonSchema(zodSchema)`.
      - Skonstruuj obiekt `response_format` typu `json_schema`.
      - Przygotuj ciało żądania (`body`) jak w `createChatCompletion`, ale dodając `response_format`.
      - Wywołaj `await this._request('/chat/completions', body)`.
      - Wywołaj `await this._handleResponse<StructuredChatCompletionResponse<any>>(response)` - **Uwaga:** Używamy `any` tymczasowo, bo typ `T` nie jest znany w `_handleResponse`.
      - Wywołaj `this._parseAndValidateJsonResponse(structuredResponse, zodSchema, schemaName)` aby uzyskać `validatedData`.
      - Dodaj metodę `getParsedJsonPayload` do `structuredResponse`, która zwraca `validatedData` (lub `null` w razie wcześniejszego błędu). Można to zrobić dynamicznie lub przez modyfikację typu zwracanego przez `_handleResponse`.
      - Zwróć wzbogacony `structuredResponse`.

5.  **Utworzenie Endpointu API (Przykład):**

    - Utwórz plik np. `src/pages/api/ai/summarize.ts`.
    - W tym pliku:
      - Zaimportuj `OpenRouterService`.
      - Zaimportuj `APIRoute` z `astro`.
      - Utwórz instancję `const openRouter = new OpenRouterService();`.
      - Zdefiniuj `export const POST: APIRoute = async ({ request }) => { ... }`.
      - **Zabezpieczenie:** Dodaj logikę sprawdzania sesji/autentykacji użytkownika (np. przy użyciu middleware lub bezpośrednio w endpoincie).
      - Odczytaj dane wejściowe z `request` (np. tekst do podsumowania).
      - Przygotuj `messages` (np. z promptem systemowym i tekstem użytkownika).
      - Wywołaj `await openRouter.createChatCompletion({ messages, model: 'openai/gpt-4o-mini', max_tokens: 150 })`.
      - Obsłuż potencjalne błędy (bloki `try...catch` dla `OpenRouterApiError`, `NetworkError`, itp.), zwracając odpowiednie statusy HTTP (np. 500, 400).
      - Zwróć odpowiedź LLM w formacie JSON do klienta.

6.  **Implementacja Endpointu API dla JSON (Przykład):**

    - Utwórz plik np. `src/pages/api/ai/generate-qa.ts`.
    - W tym pliku:
      - Zaimportuj `OpenRouterService` i `z`.
      - Zdefiniuj schemat Zod dla Q&A (`qaSchema` - jak w przykładzie w sekcji `<implementation_breakdown>`).
      - Utwórz instancję `openRouter`.
      - Zdefiniuj `export const POST: APIRoute = async ({ request }) => { ... }`.
      - **Zabezpieczenie:** Dodaj logikę autentykacji.
      - Odczytaj dane wejściowe (np. tekst źródłowy).
      - Przygotuj `messages`.
      - Wywołaj `await openRouter.createStructuredChatCompletion({ messages, model: 'openai/gpt-4o-mini' }, qaSchema, 'generate_multiple_choice_question')`.
      - W bloku `try...catch` obsłuż błędy, w tym `JsonParsingError` (który może zawierać `ZodError`).
      - Jeśli sukces, pobierz sparsowane dane: `const qaData = structuredResponse.getParsedJsonPayload();`
      - Zwróć `qaData` w odpowiedzi JSON.

7.  **Testowanie:**

    - Napisz testy jednostkowe dla `OpenRouterService` (używając Vitest), mockując `fetch` i odpowiedzi API. Przetestuj różne scenariusze (sukces, błędy API, błędy sieciowe, parsowanie JSON, walidacja Zod).
    - Napisz testy integracyjne dla endpointów API, które korzystają z usługi (można mockować `OpenRouterService` lub, ostrożnie, wykonywać rzeczywiste wywołania API w środowisku testowym z dedykowanym kluczem).
    - Rozważ testy E2E (Playwright) dla przepływów użytkownika obejmujących funkcje AI.

8.  **Dokumentacja:**
    - Dodaj komentarze JSDoc do klasy `OpenRouterService` i jej metod.
    - Zaktualizuj `README.md` lub inną dokumentację projektu, aby opisać sposób użycia usługi i wymagane zmienne środowiskowe.
