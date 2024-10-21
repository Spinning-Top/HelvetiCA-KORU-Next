import type { Response } from "express";

export class RequestHelpers {
  public static sendJsonCreated(res: Response<unknown, Record<string, unknown>>): Response<unknown, Record<string, unknown>> {
    return res.status(HttpStatusCode.Created).json({
      status: "created",
    });
  }

  public static sendJsonDeleted(res: Response<unknown, Record<string, unknown>>): Response<unknown, Record<string, unknown>> {
    return res.status(HttpStatusCode.Ok).json({
      status: "deleted",
    });
  }

  public static sendJsonError(
    res: Response<unknown, Record<string, unknown>>,
    httpStatusCode: HttpStatusCode,
    code: string,
    message: string,
    details?: Record<string, unknown> | Record<string, unknown>[],
  ): Response<unknown, Record<string, unknown>> {
    const body: Record<string, unknown> = {
      status: "error",
      code,
      message,
    };
    if (details !== undefined) body.details = details;

    return res.status(httpStatusCode).json(body);
  }

  public static sendJsonResponse(
    res: Response<unknown, Record<string, unknown>>,
    body: Record<string, unknown> | Record<string, unknown>[],
  ): Response<unknown, Record<string, unknown>> {
    return res.status(HttpStatusCode.Ok).json(body);
  }

  public static sendJsonUpdated(res: Response<unknown, Record<string, unknown>>): Response<unknown, Record<string, unknown>> {
    return res.status(HttpStatusCode.Ok).json({
      status: "updated",
    });
  }
}

export enum HttpStatusCode {
  Ok = 200,
  Created = 201,
  NoContent = 204,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  MethodNotAllowed = 405,
  RequestTimeout = 408,
  InternalServerError = 500,
}
