// third party
import type { Context } from "hono";

export class RequestHelpers {
  public static matchRoute(requestPath: string, endpointPath: string): Record<string, string> | undefined {
    const requestSegments = requestPath.split("/");
    const endpointSegments = endpointPath.split("/");
    if (requestSegments.length !== endpointSegments.length) return undefined;
    const params: Record<string, string> = {};
    for (let i = 0; i < requestSegments.length; i++) {
      if (endpointSegments[i].startsWith(":")) {
        const paramName = endpointSegments[i].slice(1);
        params[paramName] = requestSegments[i];
      } else if (endpointSegments[i] !== requestSegments[i]) {
        return undefined;
      }
    }
    return params;
  }

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

    c.status(httpStatusCode);
    return c.json(body);
  }

  public static sendJsonResponse(
    c: Context,
    body: Record<string, unknown> | Record<string, unknown>[],
    httpStatusCode: HttpStatusCode = HttpStatusCode.Ok,
  ): Response {
    c.status(httpStatusCode);
    return c.json(body);
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
