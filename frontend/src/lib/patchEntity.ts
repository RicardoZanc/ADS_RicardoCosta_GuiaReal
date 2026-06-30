import { useAuthStore } from "@/store/authStore";
import {
  ApiError,
  GENERIC_NETWORK_MESSAGE,
  parseApiErrorResponse,
} from "@/lib/errors";
import { refreshSession } from "@/lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export type PatchEntityResult<TApplied> =
  | { mode: "applied"; data: TApplied }
  | {
      mode: "pending";
      change_request_id: string;
      status: "PENDING";
    };

interface PatchEntityOptions {
  body: unknown;
}

async function fetchPatch(
  endpoint: string,
  accessToken: string | null,
  body: unknown
): Promise<Response> {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  try {
    return await fetch(`${BASE_URL}${endpoint}`, {
      method: "PATCH",
      headers,
      credentials: "include",
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, GENERIC_NETWORK_MESSAGE);
  }
}

export async function patchEntity<TApplied>(
  endpoint: string,
  { body }: PatchEntityOptions
): Promise<PatchEntityResult<TApplied>> {
  let { accessToken } = useAuthStore.getState();
  let response = await fetchPatch(endpoint, accessToken, body);

  if (response.status === 401) {
    const refreshed = await refreshSession();
    if (refreshed) {
      accessToken = refreshed.accessToken;
      response = await fetchPatch(endpoint, accessToken, body);
    } else {
      const errorBody = await response.json().catch(() => ({}));
      const { message, details } = parseApiErrorResponse(errorBody, 401);
      throw new ApiError(401, message, details);
    }
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const { message, details } = parseApiErrorResponse(
      errorBody,
      response.status
    );
    throw new ApiError(response.status, message, details);
  }

  const data = (await response.json()) as TApplied & {
    change_request_id?: string;
    status?: "PENDING";
  };

  if (response.status === 202) {
    return {
      mode: "pending",
      change_request_id: data.change_request_id as string,
      status: "PENDING",
    };
  }

  return {
    mode: "applied",
    data,
  };
}
