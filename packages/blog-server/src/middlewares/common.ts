import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

export const formValidationResult = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ result: false, message: errors.array() });
  }
  return next();
};
