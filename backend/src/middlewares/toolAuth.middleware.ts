import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../lib/errors/BaseError";
import { logger } from "../utils/logger";

const TOOL_API_KEY_HEADER = "x-tool-api-key";
const MISSING_KEY_MESSAGE = "Chave de API de ferramenta não informada";
const INVALID_KEY_MESSAGE = "Chave de API de ferramenta inválida";

function getToolApiKey(): string {
  const key = process.env.TOOL_API_KEY?.trim();
  if (!key) {
    throw new Error("TOOL_API_KEY is not configured");
  }
  return key;
}

export function authenticateToolApiKey(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    console.log('Headers: ', req.headers)
    const providedKey = req.headers[TOOL_API_KEY_HEADER];
    const key =
      typeof providedKey === "string" ? providedKey.trim() : undefined;

    if (!key) {
      logger.warn(
        "Autenticação de ferramenta falhou: header X-Tool-Api-Key ausente ou inválido"
      );
      throw new UnauthorizedError(MISSING_KEY_MESSAGE);
    }

    if (key !== getToolApiKey()) {
      logger.warn("Autenticação de ferramenta falhou: chave inválida");
      throw new UnauthorizedError(INVALID_KEY_MESSAGE);
    }

    next();
  } catch (error) {
    next(error);
  }
}
