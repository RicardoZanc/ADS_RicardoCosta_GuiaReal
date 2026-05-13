import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';
import { logger } from '../utils/logger';

export const validate = (schema: ZodObject<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Falha na validação de entrada', error.issues);
        return res.status(400).json({
          status: 'error',
          message: 'Dados inválidos',
          details: error.issues.map((issue) => ({
            path: issue.path.map(String).join('.'),
            message: issue.message,
          })),
        });
      }
      next(error);
    }
  };