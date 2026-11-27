import { APP_CONFIG } from "./constants";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${APP_CONFIG.apiUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const rawMsg = errorBody.message;
    const message = Array.isArray(rawMsg)
      ? rawMsg.join("; ")
      : rawMsg || `API error: ${response.statusText}`;
    throw new ApiError(message, response.status);
  }

  return response.json();
}
