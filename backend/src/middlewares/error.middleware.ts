import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { isBaseError, ValidationError } from "../lib/errors/BaseError";
import { logger } from "../utils/logger";

const GENERIC_SERVER_MESSAGE =
  "Ocorreu um erro interno. Tente novamente mais tarde.";

function zodIssuesToDetails(issues: ZodError["issues"]) {
  return issues.map((issue) => ({
    path: issue.path.map(String).join("."),
    message: issue.message,
  }));
}

export const errorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next
) => {
  if (isBaseError(err)) {
    const body: {
      status: string;
      message: string;
      details?: unknown;
    } = {
      status: "error",
      message: err.message,
    };
    if (err instanceof ValidationError && err.details !== undefined) {
      body.details = err.details;
    }
    res.status(err.statusCode).json(body);
    return;
  }

  if (err instanceof ZodError) {
    res.status(422).json({
      status: "error",
      message: "Dados inválidos",
      details: zodIssuesToDetails(err.issues),
    });
    return;
  }

  logger.error("Erro não tratado", err);
  res.status(500).json({
    status: "error",
    message: GENERIC_SERVER_MESSAGE,
  });
};
