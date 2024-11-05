// third party
import type { Context } from "hono";

// project
import { CryptoHelpers } from "@koru/crypto-helpers";
import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import { RabbitHelpers } from "@koru/rabbit-helpers";
import type { User } from "@koru/core-models";

export function passwordChangeEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/password-change", EndpointMethod.POST, true);

  const endpointHandler: (c: Context) => void = async (c: Context) => {
    try {
      // get the user from the context
      const user: User = c.get("user");
      // get the body from the request
      const body: Record<string, unknown> = await c.req.parseBody();
      // get the old password from the request
      const oldPassword: string | undefined = body.oldPassword as string | undefined;
      // if old password is undefined
      if (oldPassword == undefined || oldPassword.trim().length == 0) {
        // return the validation error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.BadRequest, "oldPasswordRequired", "Old password field is required");
      }
      // check old password
      const isValidPassword: boolean = CryptoHelpers.compareStringWithHash(oldPassword, user.password);
      // if the password is invalid
      if (isValidPassword === false) {
        // return the error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.Unauthorized, "invalidPassword", "Old password is not valid");
      }
      // get the new password from the request
      const newPassword: string | undefined = body.newPassword as string | undefined;
      // if new password is undefined
      if (newPassword == undefined || newPassword.trim().length == 0) {
        // return the validation error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.BadRequest, "newPasswordRequired", "New password field is required");
      }
      // set the user new password
      user.password = newPassword;
      // update the user
      await RabbitHelpers.updateEntity<User>(handler, "userUpdateRequest", user);
      // return the success response
      return RequestHelpers.sendJsonUpdated(c);
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
