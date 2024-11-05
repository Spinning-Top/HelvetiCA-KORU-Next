// third party
import type { Context } from "hono";

// project
import { CryptoHelpers } from "@koru/crypto-helpers";
import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import { RabbitHelpers } from "@koru/rabbit-helpers";
import { User } from "@koru/core-models";

export function passwordResetEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/password-reset", EndpointMethod.POST);

  const endpointHandler: (c: Context) => void = async (c: Context) => {
    try {
      // get the body from the request
      const body: Record<string, unknown> = await c.req.parseBody();
      // get the recovery token from the request
      const recoveryToken: string | undefined = body.recoveryToken as string | undefined;
      // if recovery token is undefined
      if (recoveryToken == undefined || recoveryToken.trim().length == 0) {
        // return the validation error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.BadRequest, "recoveryTokenRequired", "Recovery token field is required");
      }
      // get the new password from the request
      const newPassword: string | undefined = body.newPassword as string | undefined;
      // if new password is undefined
      if (newPassword == undefined || newPassword.trim().length == 0) {
        // return the validation error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.BadRequest, "newPasswordRequired", "New password field is required");
      }

      try {
        // verify the recovery token
        const tokenId: number | false = await CryptoHelpers.verifyToken(handler, recoveryToken);
        // if the token is not valid
        if (tokenId === false) {
          // return the error
          return RequestHelpers.sendJsonError(c, HttpStatusCode.Unauthorized, "invalidRefreshToken", "Invalid or expired refresh token");
        }
        // get the user by id in the token
        const user: User | undefined = await RabbitHelpers.getEntityById<User>(handler, "userReadRequest", User, tokenId);
        // if the user is not found
        if (user === undefined) {
          // return the error
          return RequestHelpers.sendJsonError(c, HttpStatusCode.NotFound, "userNotFound", "User not found");
        }
        // set the user new password
        user.password = newPassword;
        // update the user
        await RabbitHelpers.updateEntity<User>(handler, "userUpdateRequest", user);
        // return the success response
        return RequestHelpers.sendJsonUpdated(c);
      } catch (_error: unknown) {
        return RequestHelpers.sendJsonError(c, HttpStatusCode.Unauthorized, "invalidRefreshToken", "Invalid or expired refresh token");
      }
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
