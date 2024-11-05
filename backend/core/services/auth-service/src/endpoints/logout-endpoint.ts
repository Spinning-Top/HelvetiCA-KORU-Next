// third party
import type { Context } from "hono";

// project
import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import { RabbitHelpers } from "@koru/rabbit-helpers";
import type { User } from "@koru/core-models";

export function logoutEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/logout", EndpointMethod.POST, true);

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
        return RequestHelpers.sendJsonError(c, HttpStatusCode.BadRequest, "refreshTokenRequired", "Refresh token is required");
      }
      // remove the refresh token from the user
      user.removeRefreshToken(refreshToken);
      // update the user
      await RabbitHelpers.updateEntity<User>(handler, "userUpdateRequest", user);
      // return the success response
      return RequestHelpers.sendJsonResponse(c, { status: "Logged out successfully" });
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
