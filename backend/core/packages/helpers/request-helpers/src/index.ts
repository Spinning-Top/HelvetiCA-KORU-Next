import type { Context } from "hono";

export class RequestHelpers {
  public static sendJsonCreated(context: Context): Response {
    return context.json({ status: "created" }, HttpStatusCode.Created);
  }

  public static sendJsonDeleted(context: Context): Response {
    return context.json({ status: "deleted" }, HttpStatusCode.Ok);
  }

  public static sendJsonError(
    c: Context,
    httpStatusCode: HttpStatusCode,
    code: string,
    message: string,
    details?: Record<string, unknown> | Record<string, unknown>[],
  ): Response {
    const body: Record<string, unknown> = {
      status: "error",
      code,
      message,
    };
    if (details !== undefined) body.details = details;

    return c.json(body, httpStatusCode);
  }

  public static sendJsonResponse(c: Context, body: Record<string, unknown> | Record<string, unknown>[]): Response {
    return c.json(body, HttpStatusCode.Ok);
  }

  public static sendJsonUpdated(context: Context): Response {
    return context.json({ status: "updated" }, HttpStatusCode.Ok);
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
