// third party
import type { Context } from "hono";

// project
import { CryptoHelpers } from "@koru/crypto-helpers";
import { DatabaseHelpers } from "@koru/database-helpers";
import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import { User } from "@koru/core-models";

export function refreshTokenEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/refresh-token", EndpointMethod.POST, true);

  const endpointHandler: (c: Context) => void = async (c: Context) => {
    try {
      // get the user from the context
      const user: User = c.get("user");
      // get the body from the request
      const body: Record<string, unknown> = await c.req.parseBody();
      // get the refresh token from the request
      const refreshToken: string | undefined = body.refreshToken as string | undefined;
      // if refresh token is undefined
      if (refreshToken == undefined || refreshToken.trim().length == 0) {
        // return the validation error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.BadRequest, "refreshTokenRequired", "Refresh token field is required");
      }
      // check if the refresh token exists in the database
      const tokenExists: boolean = user.hasRefreshToken(refreshToken);
      // if the token does not exist
      if (tokenExists === false) {
        // return the error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.Forbidden, "invalidRefreshToken", "Refresh token is not valid");
      }
      try {
        // verify the refresh token
        const isTokenValid: number | false = await CryptoHelpers.verifyToken(handler, refreshToken, user);
        // if the token is not valid
        if (isTokenValid === false) {
          // return the error
          return RequestHelpers.sendJsonError(c, HttpStatusCode.Forbidden, "invalidRefreshToken", "Refresh token is not valid");
        }
        // otherwise, remove the old refresh token from the user
        user.removeRefreshToken(refreshToken);
        // create the new access token
        const newAccessToken: string = await CryptoHelpers.createAccessToken(handler, user);
        // create the new refresh token and its expiration
        const { refreshToken: newRefreshToken, expiresAt } = await CryptoHelpers.createRefreshToken(handler, user);
        // add the new refresh token to the user
        user.addRefreshToken(newRefreshToken, expiresAt);
        // update the user
        await DatabaseHelpers.updateEntity(handler, User, user);
        // return the success response
        return RequestHelpers.sendJsonResponse(c, { accessToken: newAccessToken, refreshToken: newRefreshToken });
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
