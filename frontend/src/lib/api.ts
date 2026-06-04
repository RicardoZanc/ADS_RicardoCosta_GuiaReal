import { useAuthStore } from "@/store/authStore";
import {
  ApiError,
  GENERIC_NETWORK_MESSAGE,
  parseApiErrorResponse,
} from "@/lib/errors";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export async function apiClient(
  endpoint: string,
  options: RequestOptions = {},
) {
  const { token } = useAuthStore.getState();

  let url = `${BASE_URL}${endpoint}`;

  if (options.params) {
    const searchParams = new URLSearchParams(options.params);

    url += `?${searchParams.toString()}`;
  }

  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(0, GENERIC_NETWORK_MESSAGE);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const { message, details } = parseApiErrorResponse(body, response.status);

    throw new ApiError(response.status, message, details);
  }

  return await response.json();
}
