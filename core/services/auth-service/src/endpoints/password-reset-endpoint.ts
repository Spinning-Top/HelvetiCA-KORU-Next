import { type JwtPayload, verify } from "jsonwebtoken";
import type { Request, Response } from "express";

import { Endpoint, EndpointMethod, type Handler } from "@koru/microservice";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import { RabbitHelpers } from "@koru/rabbit-helpers";
import { User } from "@koru/core-models";

export function passwordResetEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/password-reset", EndpointMethod.POST);

  const endpointHandler: (req: Request, res: Response) => void = async (req: Request, res: Response) => {
    try {
      // get the recovery token from the request
      const recoveryToken: string | undefined = req.body.recoveryToken;
      // if recovery token is undefined
      if (recoveryToken == undefined || recoveryToken.trim().length == 0) {
        // return the validation error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.BadRequest, "recoveryTokenRequired", "Recovery token field is required");
      }
      // get the new password from the request
      const newPassword: string | undefined = req.body.newPassword;
      // if new password is undefined
      if (newPassword == undefined || newPassword.trim().length == 0) {
        // return the validation error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.BadRequest, "newPasswordRequired", "New password field is required");
      }

      try {
        // verify the recovery token
        const decodedToken = verify(recoveryToken, handler.getGlobalConfig().auth.jwtSecret);
        // check if the decoded token is a JwtPayload object and contains the id
        if (typeof decodedToken === "object" && decodedToken !== null && "id" in decodedToken) {
          // get the user by id in the token
          const user: User | undefined = await RabbitHelpers.getUserByField(
            "id",
            Number((decodedToken as JwtPayload).id),
            handler.getRabbitBreeder()
          );
          // if the user is not found
          if (user === undefined) {
            // return the error
            return RequestHelpers.sendJsonError(res, HttpStatusCode.NotFound, "userNotFound", "User not found");
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
            return RequestHelpers.sendJsonError(res, HttpStatusCode.InternalServerError, "error", "User update failed");
          }
          // return the success response
          return RequestHelpers.sendJsonUpdated(res);
        } else {
          return RequestHelpers.sendJsonError(res, HttpStatusCode.Unauthorized, "invalidRefreshToken", "Invalid or expired refresh token");
        }
      } catch (_error: unknown) {
        return RequestHelpers.sendJsonError(res, HttpStatusCode.Unauthorized, "invalidRefreshToken", "Invalid or expired refresh token");
      }
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(res, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
