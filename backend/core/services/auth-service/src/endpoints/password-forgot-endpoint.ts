import type { Request, Response } from "express";
import { sign } from "jsonwebtoken";

import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import { RabbitHelpers } from "@koru/rabbit-helpers";
import type { User } from "@koru/core-models";

export function passwordForgotEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/password-forgot", EndpointMethod.POST);

  const endpointHandler: (req: Request, res: Response) => void = async (req: Request, res: Response) => {
    try {
      // get the email from the request
      const email: string | undefined = req.body.email;
      // if email is undefined
      if (email == undefined || email.trim().length == 0) {
        // return the validation error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.BadRequest, "emailRequired", "E-mail field is required");
      }
      // get the user by email
      const user: User | undefined = await RabbitHelpers.getUserByField("email", email, handler.getRabbitBreeder());
      // if necessary fields are not defined
      if (user == undefined || user.id == undefined || user.email == undefined || user.password == undefined) {
        // return the error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.Unauthorized, "userNotFound", "User not found with the provided e-mail");
      }
      // create the recovery token
      const recoveryToken = sign({ id: user.id }, handler.getGlobalConfig().auth.jwtSecret, {
        expiresIn: handler.getGlobalConfig().auth.jwtRecoveryTokenDuration,
      });
      // TODO Invia recoveryToken via email all'utente: sendRecoveryEmail(user.email, recoveryToken);
      console.log(recoveryToken);
      // send the success response
      return RequestHelpers.sendJsonResponse(res, { status: "ok", recoveryToken });
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(res, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
