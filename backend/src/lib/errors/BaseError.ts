export abstract class BaseError extends Error {
  readonly statusCode: number;
  readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function isBaseError(err: unknown): err is BaseError {
  return err instanceof BaseError;
}

export class BadRequestError extends BaseError {
  constructor(message = "Requisição inválida") {
    super(message, 400);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message = "Não autorizado") {
    super(message, 401);
  }
}

export class ForbiddenError extends BaseError {
  constructor(message = "Acesso negado") {
    super(message, 403);
  }
}

export class NotFoundError extends BaseError {
  constructor(message = "Recurso não encontrado") {
    super(message, 404);
  }
}

export class ConflictError extends BaseError {
  constructor(message = "Conflito com o estado atual do recurso") {
    super(message, 409);
  }
}

export class ValidationError extends BaseError {
  readonly details?: unknown;

  constructor(message = "Dados inválidos", details?: unknown) {
    super(message, 422);
    this.details = details;
  }
}
