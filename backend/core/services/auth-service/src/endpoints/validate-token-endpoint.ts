import type { Request, Response } from "express";
import { verify } from "jsonwebtoken";

import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";

export function validateTokenEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/validate-token", EndpointMethod.POST, true);

  const endpointHandler: (req: Request, res: Response) => void = (req: Request, res: Response) => {
    try {
      // get the authorization header from the request
      const authHeader: string | undefined = req.headers.authorization;
      // if the authorization header is undefined
      if (authHeader == undefined || authHeader.startsWith("Bearer ") === false) {
        // return the validation error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.BadRequest, "tokenRequired", "Authorization header missing or malformed");
      }
      // extract the token from the authorization header
      const token: string = authHeader.split(" ")[1];

      try {
        // verify the token
        const decoded = verify(token, handler.getGlobalConfig().auth.jwtSecret);
        // return the success response
        return RequestHelpers.sendJsonResponse(res, { valid: true, decoded });
      } catch (_error: unknown) {
        // return the error response
        return RequestHelpers.sendJsonError(res, HttpStatusCode.Unauthorized, "invalidToken", "Invalid or expired token");
      }
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(res, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
