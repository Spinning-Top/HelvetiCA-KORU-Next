import type { NextFunction, Request, Response } from "express";

// TODO
export const notFoundHandler = (_req: Request, res: Response, _next: NextFunction) => {
  res.status(404).send("<h1>Page not found on the server</h1>");
};
