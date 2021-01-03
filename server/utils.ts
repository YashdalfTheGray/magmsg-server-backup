import { RequestHandler, Request, Response, NextFunction } from 'express';

const wrap = (fn: RequestHandler) => (
  ...args: [Request, Response, NextFunction]
) => Promise.resolve(fn(...args)).catch(args[2]);

export { wrap };
