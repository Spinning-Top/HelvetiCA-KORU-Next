import type { Request, Response } from "express";

import { CryptoHelpers } from "@koru/crypto-helpers";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { User } from "@koru/core-models";

export function passwordChangeEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/password-change", EndpointMethod.POST, true);

  const endpointHandler: (req: Request, res: Response) => void = async (req: Request, res: Response) => {
    try {
      // get the user from the request
      const user: User | undefined = "user" in req ? req.user as User | undefined : undefined;
      // check if the user exists
      if (user === undefined) {
        // return an error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.Unauthorized, "unauthorized", "Authentication needed to access this endpoint");
      }

      // get the old password from the request
      const oldPassword: string | undefined = req.body.oldPassword;
      // if old password is undefined
      if (oldPassword == undefined || oldPassword.trim().length == 0) {
        // return the validation error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.BadRequest, "oldPasswordRequired", "Old password field is required");
      }
      // check old password
      const isValidPassword: boolean = CryptoHelpers.compareStringWithHash(oldPassword, user.password);
      // if the password is invalid
      if (isValidPassword === false) {
        // return the error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.Unauthorized, "invalidPassword", "Old password is not valid");
      }
      // get the new password from the request
      const newPassword: string | undefined = req.body.newPassword;
      // if new password is undefined
      if (newPassword == undefined || newPassword.trim().length == 0) {
        // return the validation error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.BadRequest, "newPasswordRequired", "New password field is required");
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
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(res, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
