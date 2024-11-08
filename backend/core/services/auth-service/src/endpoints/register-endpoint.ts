// third party
import type { Context } from "hono";

// project
import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import { RabbitHelpers } from "@koru/rabbit-helpers";
import { User } from "@koru/core-models";

export function registerEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/register", EndpointMethod.POST);

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
      // get the first name from the request
      const firstName: string | undefined = body.firstName as string | undefined;
      // if first name is undefined
      if (firstName == undefined || firstName.trim().length == 0) {
        // return the validation error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.BadRequest, "firstNameRequired", "First name field is required");
      }
      // get the last name from the request
      const lastName: string | undefined = body.lastName as string | undefined;
      // if last name is undefined
      if (lastName == undefined || lastName.trim().length == 0) {
        // return the validation error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.BadRequest, "lastNameRequired", "Last name field is required");
      }
      // get the password from the request
      const password: string | undefined = body.password as string | undefined;
      // if password is undefined
      if (password == undefined || password.trim().length == 0) {
        // return the validation error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.BadRequest, "passwordRequired", "Password field is required");
      }
      // check if the user with the same email already exists
      const existingUser: User | undefined = await RabbitHelpers.getEntityByField<User>(handler, "userReadRequest", User, "email", email);
      if (existingUser != undefined) {
        // return the validation error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.BadRequest, "duplicatedEmail", "User with the same email already exists");
      }
      // create the new user
      const newUser: User = new User(email, firstName, lastName);
      // set the user locale and theme
      newUser.locale = handler.getGlobalConfig().koru.defaultLocale;
      newUser.theme = handler.getGlobalConfig().koru.defaultTheme;
      // set the new user password
      newUser.password = password;
      // create the user
      await RabbitHelpers.createEntity<User>(handler, "userCreateRequest", newUser);
      // TODOMAIL send email confirmation
      // return the success response
      return RequestHelpers.sendJsonCreated(c);
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
