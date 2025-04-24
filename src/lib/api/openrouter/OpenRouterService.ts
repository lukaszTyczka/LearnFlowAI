import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

// Types
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionParams {
  model?: string;
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
          schema: object;
        };
      }
    | { type: "text" };
  stream?: boolean;
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
}

export interface StructuredChatCompletionResponse<T>
  extends Omit<ChatCompletionResponse, "choices"> {
  choices: Array<{
    index: number;
    message: {
      role: "assistant";
      content: null;
      tool_calls: Array<{
        id: string;
        type: "function";
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
    finish_reason: string;
  }>;
  getParsedJsonPayload: () => T | null;
}

// Custom Error Classes
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

// OpenRouter Service Class
export class OpenRouterService {
  private readonly apiKey: string;
  private readonly defaultModel: string;
  private readonly baseURL: string;

  constructor(
    config: {
      apiKey?: string;
      defaultModel?: string;
      baseURL?: string;
    } = {}
  ) {
    this.apiKey = config.apiKey || import.meta.env.OPENROUTER_API_KEY;
    if (!this.apiKey) {
      console.error(
        "OpenRouter API Key is missing. Please set OPENROUTER_API_KEY environment variable."
      );
      throw new Error("OpenRouter API Key is not configured.");
    }

    this.defaultModel = config.defaultModel || "openai/gpt-4o-mini";
    this.baseURL = config.baseURL || "https://openrouter.ai/api/v1";
  }

  public async createChatCompletion(
    params: ChatCompletionParams
  ): Promise<ChatCompletionResponse> {
    const body = {
      ...params,
      model: params.model || this.defaultModel,
      response_format: params.response_format || { type: "text" },
      stream: false, // Ensure streaming is disabled for basic completions
    };

    const response = await this._request("/chat/completions", body);
    return this._handleResponse<ChatCompletionResponse>(response);
  }

  public async createStructuredChatCompletion<T>(
    params: Omit<ChatCompletionParams, "response_format">,
    zodSchema: z.ZodType<T>,
    schemaName: string,
    strict: boolean = true
  ): Promise<StructuredChatCompletionResponse<T>> {
    const jsonSchema = zodToJsonSchema(zodSchema);

    const body = {
      ...params,
      model: params.model || this.defaultModel,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: schemaName,
          strict: strict,
          schema: jsonSchema,
        },
      },
      stream: false,
    };

    const response = await this._request("/chat/completions", body);
    const structuredResponse = await this._handleResponse<
      StructuredChatCompletionResponse<T>
    >(response);

    // Add the getParsedJsonPayload method to the response
    let cachedPayload: T | null = null;
    let hasAttemptedParse = false;

    structuredResponse.getParsedJsonPayload = () => {
      if (!hasAttemptedParse) {
        try {
          cachedPayload = this._parseAndValidateJsonResponse(
            structuredResponse,
            zodSchema,
            schemaName
          );
        } catch (error) {
          console.error("Failed to parse JSON payload:", error);
          cachedPayload = null;
        }
        hasAttemptedParse = true;
      }
      return cachedPayload;
    };

    return structuredResponse;
  }

  private async _request(
    endpoint: string,
    body: Record<string, any>
  ): Promise<Response> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://learnflowai.com",
      "X-Title": "LearnFlowAI",
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(body),
      });
      return response;
    } catch (error: any) {
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

  private async _handleResponse<T>(response: Response): Promise<T> {
    let responseBody;
    try {
      responseBody = await response.json();
    } catch (e) {
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
      const errorDetails = responseBody?.error || responseBody;
      console.error(errorMessage, errorDetails);

      // Handle rate limiting specifically
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        throw new OpenRouterApiError(
          `Rate limit exceeded. Retry after ${
            retryAfter || "unknown"
          } seconds.`,
          response.status,
          { ...errorDetails, retryAfter }
        );
      }

      throw new OpenRouterApiError(errorMessage, response.status, errorDetails);
    }

    return responseBody as T;
  }

  private _parseAndValidateJsonResponse<T>(
    response: StructuredChatCompletionResponse<any>,
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
      const validatedData = zodSchema.parse(parsedArgs);
      return validatedData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(
          "Zod validation failed for structured response:",
          error.errors
        );
        throw new JsonParsingError(
          `Validation failed for structured response (schema: ${schemaName}): ${error.message}`,
          JSON.stringify(parsedArgs),
          error
        );
      }
      console.error("Unexpected error during Zod validation:", error);
      throw error;
    }
  }
}
