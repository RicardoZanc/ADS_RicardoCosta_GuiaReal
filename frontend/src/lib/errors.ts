export interface ApiErrorResponse {
  status?: string;
  message?: string;
  details?: unknown;
}

export type ApiValidationDetail = {
  path: string;
  message: string;
};

export const GENERIC_NETWORK_MESSAGE =
  "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";

const GENERIC_CLIENT_MESSAGE = "Erro inesperado na requisição.";

const GENERIC_SERVER_MESSAGE =
  "Ocorreu um erro interno. Tente novamente mais tarde.";

export class ApiError extends Error {
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = "ApiError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

export function parseApiErrorResponse(
  body: unknown,
  statusCode: number,
): { message: string; details?: unknown } {
  const data =
    body && typeof body === "object" ? (body as ApiErrorResponse) : {};

  const message =
    typeof data.message === "string" && data.message.trim().length > 0
      ? data.message
      : statusCode >= 500
        ? GENERIC_SERVER_MESSAGE
        : GENERIC_CLIENT_MESSAGE;

  const details = data.details !== undefined ? data.details : undefined;

  return { message, details };
}
