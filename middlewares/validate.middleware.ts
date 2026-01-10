import { z } from 'zod';
import { NextFunction, Request, Response } from 'express';

export const validate = (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message
        })),
      });
    }
    next(err);
  }
};
