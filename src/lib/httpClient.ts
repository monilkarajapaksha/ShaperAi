const DEFAULT_TIMEOUT = 10_000;
const DEFAULT_RETRY_ATTEMPTS = 2;
const DEFAULT_RETRY_DELAY = 300;

export interface HttpClientConfig {
  baseUrl: string;
  defaultHeaders?: HeadersInit;
  getAuthToken?: () => string | null | undefined;
  retry?: {
    attempts: number;
    delay: number;
  };
  timeout?: number;
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface HttpRequestOptions
  extends Omit<RequestInit, "method" | "body" | "headers" | "signal"> {
  method?: HttpMethod;
  data?: unknown;
  body?: BodyInit | null;
  headers?: HeadersInit;
  auth?: boolean;
  timeout?: number;
  retries?: number;
  signal?: AbortSignal;
}

export class HttpError extends Error {
  status: number;
  statusText: string;
  url: string;
  data?: unknown;

  constructor(params: {
    message: string;
    status: number;
    statusText: string;
    url: string;
    data?: unknown;
  }) {
    super(params.message);
    this.name = "HttpError";
    this.status = params.status;
    this.statusText = params.statusText;
    this.url = params.url;
    this.data = params.data;
  }
}

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

class HttpClient {
  private readonly baseUrl: string;
  private readonly getAuthToken?: () => string | null | undefined;
  private readonly defaultHeaders?: HeadersInit;
  private readonly defaultTimeout: number;
  private readonly retryAttempts: number;
  private readonly retryDelay: number;

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl;
    this.getAuthToken = config.getAuthToken;
    this.defaultHeaders = config.defaultHeaders;
    this.defaultTimeout = config.timeout ?? DEFAULT_TIMEOUT;
    this.retryAttempts = config.retry?.attempts ?? DEFAULT_RETRY_ATTEMPTS;
    this.retryDelay = config.retry?.delay ?? DEFAULT_RETRY_DELAY;
  }

  public get<TResponse>(path: string, options?: HttpRequestOptions) {
    return this.request<TResponse>(path, { ...options, method: "GET" });
  }

  public post<TResponse>(path: string, options?: HttpRequestOptions) {
    return this.request<TResponse>(path, { ...options, method: "POST" });
  }

  public put<TResponse>(path: string, options?: HttpRequestOptions) {
    return this.request<TResponse>(path, { ...options, method: "PUT" });
  }

  public patch<TResponse>(path: string, options?: HttpRequestOptions) {
    return this.request<TResponse>(path, { ...options, method: "PATCH" });
  }

  public delete<TResponse>(path: string, options?: HttpRequestOptions) {
    return this.request<TResponse>(path, { ...options, method: "DELETE" });
  }

  private async request<TResponse>(
    path: string,
    options: HttpRequestOptions = {}
  ): Promise<TResponse> {
    const {
      method = "GET",
      headers,
      data,
      body,
      auth = true,
      timeout = this.defaultTimeout,
      retries = this.retryAttempts,
      signal,
      ...rest
    } = options;

    const totalAttempts = Math.max(1, retries + 1);
    const url = this.resolveUrl(path);
    let lastError: unknown;

    for (let attempt = 0; attempt < totalAttempts; attempt += 1) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const abortHandler = () => controller.abort();
      if (signal) {
        if (signal.aborted) {
          controller.abort();
        } else {
          signal.addEventListener("abort", abortHandler, { once: true });
        }
      }

      try {
        const requestHeaders = this.buildHeaders(headers, auth);
        const requestBody = this.buildBody(data, body, requestHeaders);

        const response = await fetch(url, {
          ...rest,
          method,
          headers: requestHeaders,
          body: requestBody,
          signal: controller.signal,
        });

        if (!response.ok) {
          throw await this.createHttpError(url, response);
        }

        return (await this.parseResponse<TResponse>(response)) as TResponse;
      } catch (error) {
        lastError = error;
        if (!this.shouldRetry(error, attempt, totalAttempts)) {
          throw error;
        }
        await wait(this.getRetryDelay(attempt));
      } finally {
        clearTimeout(timeoutId);
        if (signal && !signal.aborted) {
          signal.removeEventListener("abort", abortHandler);
        }
      }
    }

    throw lastError;
  }

  private resolveUrl(path: string) {
    try {
      return new URL(path, this.baseUrl).toString();
    } catch {
      // If path is already a full URL
      return path;
    }
  }

  private buildHeaders(headers: HeadersInit | undefined, auth: boolean) {
    const mergedHeaders = new Headers(this.defaultHeaders ?? {});

    if (headers) {
      const incoming = new Headers(headers);
      incoming.forEach((value, key) => mergedHeaders.set(key, value));
    }

    if (auth && this.getAuthToken) {
      const token = this.safeGetAuthToken();
      if (token) {
        mergedHeaders.set("Authorization", `Bearer ${token}`);
      }
    }

    return mergedHeaders;
  }

  private buildBody(
    data: unknown,
    body: BodyInit | null | undefined,
    headers: Headers
  ): BodyInit | null | undefined {
    if (body !== undefined) {
      return body;
    }

    if (data === undefined || data === null) {
      return undefined;
    }

    if (
      typeof FormData !== "undefined" &&
      data instanceof FormData
    ) {
      return data;
    }

    if (
      typeof URLSearchParams !== "undefined" &&
      data instanceof URLSearchParams
    ) {
      headers.set("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
      return data;
    }

    if (typeof Blob !== "undefined" && data instanceof Blob) {
      return data;
    }

    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    return JSON.stringify(data);
  }

  private async createHttpError(url: string, response: Response) {
    let parsedBody: unknown;
    const contentType = response.headers.get("content-type") ?? "";

    try {
      if (contentType.includes("application/json")) {
        parsedBody = await response.json();
      } else {
        parsedBody = await response.text();
      }
    } catch {
      parsedBody = undefined;
    }

    const message =
      parsedBody && typeof parsedBody === "object"
        ? JSON.stringify(parsedBody)
        : `Request failed with status ${response.status}`;

    return new HttpError({
      message,
      status: response.status,
      statusText: response.statusText,
      url,
      data: parsedBody,
    });
  }

  private async parseResponse<TResponse>(response: Response) {
    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return undefined as TResponse;
    }

    const contentType = response.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      return (await response.json()) as TResponse;
    }

    if (contentType.startsWith("text/")) {
      return (await response.text()) as unknown as TResponse;
    }

    return (await response.blob()) as unknown as TResponse;
  }

  private shouldRetry(error: unknown, attempt: number, totalAttempts: number) {
    if (attempt >= totalAttempts - 1) {
      return false;
    }

    if (error instanceof HttpError) {
      return error.status >= 500;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      return false;
    }

    return true;
  }

  private getRetryDelay(attempt: number) {
    return this.retryDelay * Math.max(1, attempt + 1);
  }

  private safeGetAuthToken() {
    if (typeof window === "undefined") {
      return null;
    }

    return this.getAuthToken?.() ?? null;
  }
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787";

export const httpClient = new HttpClient({
  baseUrl: API_BASE_URL,
  defaultHeaders: {
    Accept: "application/json",
  },
  getAuthToken: () => {
    if (typeof window === "undefined") {
      return null;
    }
    return window.localStorage.getItem("authToken");
  },
  retry: {
    attempts: DEFAULT_RETRY_ATTEMPTS,
    delay: DEFAULT_RETRY_DELAY,
  },
  timeout: DEFAULT_TIMEOUT,
});

export default httpClient;
