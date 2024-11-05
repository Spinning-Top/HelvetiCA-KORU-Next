// third party
import type { Context } from "hono";

// project
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
      const user: User | undefined = await RabbitHelpers.getEntityByField<User>(handler, "userReadRequest", User, "email", email);
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
      const accessToken: string = await CryptoHelpers.createAccessToken(handler, user);
      // create the refresh token and its expiration
      const { refreshToken, expiresAt } = await CryptoHelpers.createRefreshToken(handler, user);
      // add refresh token to the user
      user.addRefreshToken(refreshToken, expiresAt);
      // update the user
      await RabbitHelpers.updateEntity<User>(handler, "userUpdateRequest", user);
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
