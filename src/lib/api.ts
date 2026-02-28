/**
 * Typed API helper with error handling, optimistic updates, and rollback.
 *
 * Usage:
 *   const result = await apiCall<HabitWithStats>("/api/habits", {
 *     method: "POST",
 *     body: { name: "Meditate", color: "#22c55e" },
 *     onError: (msg) => showToast(msg),
 *   });
 */

export interface ApiCallOptions<T> {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Called on error with a human-readable message */
  onError?: (message: string) => void;
  /** Called on success with parsed response data */
  onSuccess?: (data: T) => void;
  /** If provided, will be called on error to rollback optimistic state */
  rollback?: () => void;
}

export interface ApiResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export async function apiCall<T = unknown>(
  url: string,
  options: ApiCallOptions<T> = {}
): Promise<ApiResult<T>> {
  const { method = "GET", body, onError, onSuccess, rollback } = options;

  try {
    const init: RequestInit = {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    };

    const res = await fetch(url, init);

    if (!res.ok) {
      let errorMsg = `Request failed (${res.status})`;
      try {
        const errBody = await res.json();
        if (errBody.error) errorMsg = errBody.error;
      } catch { /* swallow parse error */ }

      rollback?.();
      onError?.(errorMsg);
      return { ok: false, error: errorMsg };
    }

    const data = (await res.json()) as T;
    onSuccess?.(data);
    return { ok: true, data };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Network error";
    rollback?.();
    onError?.(errorMsg);
    return { ok: false, error: errorMsg };
  }
}

/**
 * Fire-and-forget version — doesn't await, swallows errors.
 * Good for background sync where failure is acceptable.
 */
export function apiSync(url: string, method: string, body?: unknown): void {
  fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  }).catch(() => {});
}
