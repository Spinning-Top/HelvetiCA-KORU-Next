import type { Request, Response } from "express";
import { sign } from "jsonwebtoken";

import { CryptoHelpers } from "@koru/crypto-helpers";
import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import { RabbitHelpers } from "@koru/rabbit-helpers";
import { User } from "@koru/core-models";

export function loginEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/login", EndpointMethod.POST);

  const endpointHandler: (req: Request, res: Response) => void = async (req: Request, res: Response) => {
    try {
      // get the email from the request
      const email: string | undefined = req.body.email;
      // if email is undefined
      if (email == undefined || email.trim().length == 0) {
        // return the validation error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.BadRequest, "emailRequired", "E-mail field is required");
      }
      // get the password from the request
      const password: string | undefined = req.body.password;
      // if password is undefined
      if (password == undefined || password.trim().length == 0) {
        // return the validation error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.BadRequest, "passwordRequired", "Password field is required");
      }
      // get the user by email
      const user: User | undefined = await RabbitHelpers.getUserByField("email", email, handler.getRabbitBreeder());
      // if necessary fields are not defined
      if (user == undefined || user.id == undefined || user.email == undefined || user.password == undefined) {
        // return the error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.Unauthorized, "userNotFound", "User not found with the provided e-mail");
      }
      // compare the password with the hash
      const isValidPassword: boolean = CryptoHelpers.compareStringWithHash(password, user.password);
      // if the password is invalid
      if (isValidPassword === false) {
        // return the error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.Unauthorized, "invalidPassword", "Password is not valid");
      }
      // create the access token
      const accessToken = sign({ id: user.id }, handler.getGlobalConfig().auth.jwtSecret, {
        expiresIn: handler.getGlobalConfig().auth.jwtAccessTokenDuration,
      });
      // create the refresh token
      const refreshToken = sign({ id: user.id }, handler.getGlobalConfig().auth.jwtSecret, {
        expiresIn: handler.getGlobalConfig().auth.jwtRefreshTokenDuration,
      });
      // add refresh token to the user
      user.addRefreshToken(refreshToken);
      // TODO create and save token
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
      return RequestHelpers.sendJsonResponse(res, { accessToken, refreshToken });
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(res, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
