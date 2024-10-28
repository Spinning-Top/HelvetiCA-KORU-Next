import type { Context } from "hono";
import type { JWTPayload } from "hono/utils/jwt/types";
import { verify } from "hono/jwt";

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
        const decodedToken: JWTPayload = await verify(recoveryToken, handler.getGlobalConfig().auth.jwtSecret);
        // check if the decoded token is a JwtPayload object and contains the id
        if (typeof decodedToken === "object" && decodedToken !== null && "id" in decodedToken) {
          // get the user by id in the token
          const user: User | undefined = await RabbitHelpers.getUserByField(
            "id",
            Number(decodedToken.id),
            handler.getRabbitBreeder(),
          );
          // if the user is not found
          if (user === undefined) {
            // return the error
            return RequestHelpers.sendJsonError(c, HttpStatusCode.NotFound, "userNotFound", "User not found");
          }
          // set the user new password
          user.password = newPassword;
          // save user with rabbit
          const savedUser: User | undefined = await handler
            .getRabbitBreeder()
            .sendRequestAndAwaitResponse<User>("userUpdate", "userUpdateResponse", user.toJson(), (data: Record<string, unknown>) => {
              return User.createFromJsonData(data, new User());
            });
          // check if the user was saved
          if (savedUser === undefined) {
            // return the error
            return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", "User update failed");
          }
          // return the success response
          return RequestHelpers.sendJsonUpdated(c);
        } else {
          return RequestHelpers.sendJsonError(c, HttpStatusCode.Unauthorized, "invalidRefreshToken", "Invalid or expired refresh token");
        }
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
