// third party
import type { Context } from "hono";

// project
import { CryptoHelpers } from "@koru/crypto-helpers";
import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import { RabbitHelpers } from "@koru/rabbit-helpers";
import { User } from "@koru/core-models";

export function passwordForgotEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/password-forgot", EndpointMethod.POST);

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
      // get the user by email
      const user: User | undefined = await RabbitHelpers.getEntityByField<User>(handler, "userReadRequest", User, "email", email);
      // if necessary fields are not defined
      if (user == undefined || user.id == undefined || user.email == undefined || user.password == undefined) {
        // return the error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.Unauthorized, "userNotFound", "User not found with the provided e-mail");
      }
      // create the recovery token
      const recoveryToken: string = await CryptoHelpers.createRecoveryToken(handler, user);
      // TODOMAIL Invia recoveryToken via email all'utente: sendRecoveryEmail(user.email, recoveryToken);
      // send the success response
      return RequestHelpers.sendJsonResponse(c, { status: "ok", recoveryToken });
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
