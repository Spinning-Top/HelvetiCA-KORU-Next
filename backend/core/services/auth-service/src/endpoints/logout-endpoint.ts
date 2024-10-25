import type { Request, Response } from "express";

import { Endpoint, EndpointMethod, type Handler } from "@koru/microservice";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import { User } from "@koru/core-models";

export function logoutEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/logout", EndpointMethod.POST, true);

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
        return RequestHelpers.sendJsonError(res, HttpStatusCode.BadRequest, "refreshTokenRequired", "Refresh token is required");
      }
      // remove the refresh token from the user
      user.removeRefreshToken(refreshToken);
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
      return RequestHelpers.sendJsonResponse(res, { status: "Logged out successfully" });
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(res, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
