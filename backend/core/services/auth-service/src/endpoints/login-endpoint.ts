import type { Context } from "hono";
import type { JWTPayload } from "hono/utils/jwt/types";
import { sign } from "hono/jwt";

import { CryptoHelpers } from "@koru/crypto-helpers";
import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import { RabbitHelpers } from "@koru/rabbit-helpers";
import { User } from "@koru/core-models";

export function loginEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/login", EndpointMethod.POST);

  const endpointHandler: (c: Context) => void = async (c: Context) => {
    try {
      // get the body from the request
      const body: Record<string, unknown> = await c.req.parseBody();
      // get the email from the request
      const email: string | undefined = body.email as string | undefined;
      // if email is undefined
      if (email == undefined || email.trim().length == 0) {
        // return the validation error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.BadRequest, "emailRequired", "E-mail field is required");
      }
      // get the password from the request
      const password: string | undefined = body.password as string | undefined;
      // if password is undefined
      if (password == undefined || password.trim().length == 0) {
        // return the validation error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.BadRequest, "passwordRequired", "Password field is required");
      }
      // get the user by email
      const user: User | undefined = await RabbitHelpers.getUserByField("email", email, handler.getRabbitBreeder());
      // if necessary fields are not defined
      if (user == undefined || user.id == undefined || user.email == undefined || user.password == undefined) {
        // return the error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.Unauthorized, "userNotFound", "User not found with the provided e-mail");
      }
      // compare the password with the hash
      const isValidPassword: boolean = CryptoHelpers.compareStringWithHash(password, user.password);
      // if the password is invalid
      if (isValidPassword === false) {
        // return the error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.Unauthorized, "invalidPassword", "Password is not valid");
      }
      // create the access token
      const accessTokenPayload: JWTPayload = {
        id: user.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + handler.getGlobalConfig().auth.jwtAccessTokenDuration,
      };
      const accessToken: string = await sign(accessTokenPayload, handler.getGlobalConfig().auth.jwtSecret);
      // create the refresh token
      const refreshTokenPayload: JWTPayload = {
        id: user.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + handler.getGlobalConfig().auth.jwtRefreshTokenDuration,
      };
      const refreshToken: string = await sign(refreshTokenPayload, handler.getGlobalConfig().auth.jwtSecret);
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
        return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", "User update failed");
      }
      // return the success response
      return RequestHelpers.sendJsonResponse(c, { accessToken, refreshToken });
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
