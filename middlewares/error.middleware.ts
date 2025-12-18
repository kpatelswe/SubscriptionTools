import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/index.js';

const errorMiddleware = (err: AppError, req: Request, res: Response, next: NextFunction): void => {
  try {
    let error: AppError = { ...err, message: err.message, name: err.name };

    console.error(err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
      const message = 'Resource not found';
      error = new Error(message) as AppError;
      error.statusCode = 404;
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
      const message = 'Duplicate field value entered';
      error = new Error(message) as AppError;
      error.statusCode = 400;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError' && err.errors) {
      const message = Object.values(err.errors).map((val) => val.message);
      error = new Error(message.join(', ')) as AppError;
      error.statusCode = 400;
    }

    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Server Error',
    });
  } catch (error) {
    next(error);
  }
};

export default errorMiddleware;

