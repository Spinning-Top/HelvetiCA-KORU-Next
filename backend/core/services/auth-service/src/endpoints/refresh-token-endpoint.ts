import { type JwtPayload, sign, verify } from "jsonwebtoken";
import type { Request, Response } from "express";

import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import type { User } from "@koru/core-models";

export function refreshTokenEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/refresh-token", EndpointMethod.POST, true);

  const endpointHandler: (req: Request, res: Response) => void = async (req: Request, res: Response) => {
    try {
      // get the user from the request
      const user: User | undefined = "user" in req ? req.user as User | undefined : undefined;
      // check if the user exists
      if (user === undefined) {
        // return an error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.Unauthorized, "unauthorized", "Authentication needed to access this endpoint");
      }

      // get the refresh token from the request
      const refreshToken: string | undefined = req.body.refreshToken;
      // if refresh token is undefined
      if (refreshToken == undefined || refreshToken.trim().length == 0) {
        // return the validation error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.BadRequest, "refreshTokenRequired", "Refresh token field is required");
      }
      // check if the refresh token exists in the database
      const tokenExists: boolean = await user.hasRefreshToken(refreshToken);
      // if the token does not exist
      if (tokenExists === false) {
        // return the error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.Forbidden, "invalidRefreshToken", "Refresh token is not valid");
      }

      try {
        // verify the refresh token
        const decodedToken = verify(refreshToken, handler.getGlobalConfig().auth.jwtSecret);
        // check if the decoded token is a JwtPayload object and contains the id
        if (typeof decodedToken === "object" && decodedToken !== null && "id" in decodedToken) {
          // create a new access token
          const newAccessToken = sign({ id: (decodedToken as JwtPayload).id }, handler.getGlobalConfig().auth.jwtSecret, {
            expiresIn: handler.getGlobalConfig().auth.jwtAccessTokenDuration,
          });
          // return the new access token
          return RequestHelpers.sendJsonResponse(res, { accessToken: newAccessToken });
        } else {
          // otherwise, return the error
          return RequestHelpers.sendJsonError(res, HttpStatusCode.Forbidden, "invalidRefreshToken", "Refresh token is not valid");
        }
      } catch (_error: unknown) {
        // otherwise, return the error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.Forbidden, "invalidRefreshToken", "Refresh token is not valid");
      }
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(res, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
