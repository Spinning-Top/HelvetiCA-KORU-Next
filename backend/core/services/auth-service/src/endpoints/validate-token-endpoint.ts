import type { Context } from "hono";
import type { JWTPayload } from "hono/utils/jwt/types";
import { verify } from "hono/jwt";

import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";

export function validateTokenEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/validate-token", EndpointMethod.POST, true);

  const endpointHandler: (c: Context) => void = async (c: Context) => {
    try {
      // get the authorization header from the request
      const authHeader: string | undefined = c.req.header("Authorization");
      // if the authorization header is undefined
      if (authHeader == undefined || authHeader.startsWith("Bearer ") === false) {
        // return the validation error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.BadRequest, "tokenRequired", "Authorization header missing or malformed");
      }
      // extract the token from the authorization header
      const token: string = authHeader.split(" ")[1];

      try {
        // verify the token
        const decoded: JWTPayload = await verify(token, handler.getGlobalConfig().auth.jwtSecret);
        // return the success response
        return RequestHelpers.sendJsonResponse(c, { valid: true, decoded });
      } catch (_error: unknown) {
        // return the error response
        return RequestHelpers.sendJsonError(c, HttpStatusCode.Unauthorized, "invalidToken", "Invalid or expired token");
      }
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
