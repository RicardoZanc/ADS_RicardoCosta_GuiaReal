import { Request, Response, NextFunction } from "express";
import { ZodObject } from "zod";

export const validate = (schema: ZodObject<any>) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Sobrescreve com os dados transformados/limpos pelo Zod
      req.body = validatedData.body;
      // Express 5: `req.query` é apenas getter no prototype; atribuição direta lança TypeError
      Object.defineProperty(req, "query", {
        value: validatedData.query,
        writable: true,
        enumerable: true,
        configurable: true,
      });
      req.params = validatedData.params as any;

      next();
    } catch (error) {
      next(error);
    }
  };
