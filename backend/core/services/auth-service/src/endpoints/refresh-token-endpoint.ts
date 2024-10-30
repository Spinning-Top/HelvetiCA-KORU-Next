import type { Context } from "hono";
import type { JWTPayload } from "hono/utils/jwt/types";
import { sign, verify } from "hono/jwt";

import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import type { User } from "@koru/core-models";

export function refreshTokenEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/refresh-token", EndpointMethod.POST, true);

  const endpointHandler: (c: Context) => void = async (c: Context) => {
    try {
      // get the body from the request
      const body: Record<string, unknown> = await c.req.parseBody();
      // get the user from the context
      const user: User | undefined = c.get("user");
      // check if the user exists
      if (user === undefined) {
        // return an error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.Unauthorized, "unauthorized", "Authentication needed to access this endpoint");
      }

      // get the refresh token from the request
      const refreshToken: string | undefined = body.refreshToken as string | undefined;
      // if refresh token is undefined
      if (refreshToken == undefined || refreshToken.trim().length == 0) {
        // return the validation error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.BadRequest, "refreshTokenRequired", "Refresh token field is required");
      }
      // check if the refresh token exists in the database
      const tokenExists: boolean = await user.hasRefreshToken(refreshToken);
      // if the token does not exist
      if (tokenExists === false) {
        // return the error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.Forbidden, "invalidRefreshToken", "Refresh token is not valid");
      }

      try {
        // verify the refresh token
        const decodedToken: JWTPayload = await verify(refreshToken, handler.getGlobalConfig().auth.jwtSecret);
        // check if the decoded token is a JwtPayload object and contains the id
        if (typeof decodedToken === "object" && decodedToken !== null && "id" in decodedToken) {
          // create a new access token
          const newAccessTokenPayload: JWTPayload = {
            id: decodedToken.id,
            exp: Math.floor(Date.now() / 1000) + handler.getGlobalConfig().auth.jwtAccessTokenDuration,
          };
          const newAccessToken = sign(newAccessTokenPayload, handler.getGlobalConfig().auth.jwtSecret);
          // return the new access token
          return RequestHelpers.sendJsonResponse(c, { accessToken: newAccessToken });
        } else {
          // otherwise, return the error
          return RequestHelpers.sendJsonError(c, HttpStatusCode.Forbidden, "invalidRefreshToken", "Refresh token is not valid");
        }
      } catch (_error: unknown) {
        // otherwise, return the error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.Forbidden, "invalidRefreshToken", "Refresh token is not valid");
      }
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
