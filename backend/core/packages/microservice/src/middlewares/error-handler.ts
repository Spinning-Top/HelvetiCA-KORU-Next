import type { NextFunction, Request, Response } from "express";

// TODO
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).send({ errors: [{ message: "Something went wrong" }] });
};
