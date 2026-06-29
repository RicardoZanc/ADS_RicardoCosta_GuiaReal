import { useAuthStore } from "@/store/authStore";
import {
  ApiError,
  GENERIC_NETWORK_MESSAGE,
  parseApiErrorResponse,
} from "@/lib/errors";
import type { AuthTokenResponse } from "@/lib/types/auth";
import { redirectToLogin } from "@/lib/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const AUTH_PUBLIC_PATHS = [
  "/auth/login",
  "/auth/signup",
  "/auth/refresh",
  "/auth/logout",
] as const;

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
  skipAuthRetry?: boolean;
}

export type RefreshSessionResult = AuthTokenResponse | null;

let refreshPromise: Promise<RefreshSessionResult> | null = null;

function isAuthPublicPath(endpoint: string): boolean {
  const path = endpoint.split("?")[0];
  return AUTH_PUBLIC_PATHS.some(
    (publicPath) => path === publicPath || path.endsWith(publicPath)
  );
}

function buildUrl(endpoint: string, params?: Record<string, string>): string {
  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }
  return url;
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const { message, details } = parseApiErrorResponse(body, response.status);
    throw new ApiError(response.status, message, details);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export async function refreshSession(): Promise<RefreshSessionResult> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(buildUrl("/auth/refresh"), {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          return null;
        }

        const data = (await response.json()) as AuthTokenResponse;
        useAuthStore.getState().setAuth(data.accessToken, data.user);
        return data;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
}

async function fetchWithAuth(
  endpoint: string,
  options: RequestOptions,
  accessToken: string | null
): Promise<Response> {
  const { params, skipAuthRetry: _skip, headers: customHeaders, ...init } =
    options;

  const headers = new Headers(customHeaders);
  headers.set("Content-Type", "application/json");

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  try {
    return await fetch(buildUrl(endpoint, params), {
      ...init,
      headers,
      credentials: "include",
    });
  } catch {
    throw new ApiError(0, GENERIC_NETWORK_MESSAGE);
  }
}

export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuthRetry = false } = options;
  let { accessToken } = useAuthStore.getState();

  let response = await fetchWithAuth(endpoint, options, accessToken);

  const shouldRetryAuth =
    response.status === 401 &&
    !skipAuthRetry &&
    !isAuthPublicPath(endpoint);

  if (shouldRetryAuth) {
    const hadToken = accessToken !== null;
    const refreshed = await refreshSession();

    if (refreshed) {
      accessToken = refreshed.accessToken;
      response = await fetchWithAuth(endpoint, options, accessToken);
    } else {
      useAuthStore.getState().clearAuth();
      if (hadToken) {
        redirectToLogin();
      }
      const body = await response.json().catch(() => ({}));
      const { message, details } = parseApiErrorResponse(body, 401);
      throw new ApiError(401, message, details);
    }
  }

  return parseJsonResponse<T>(response);
}
