import type { Request, Response } from "express";

import { Endpoint, EndpointMethod, type Handler } from "@koru/microservice";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import { User } from "@koru/core-models";

export function registerEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/register", EndpointMethod.POST);

  const endpointHandler: (req: Request, res: Response) => void = async (req: Request, res: Response) => {
    try {
      // get the email from the request
      const email: string | undefined = req.body.email;
      // if email is undefined
      if (email == undefined || email.trim().length == 0) {
        // return the validation error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.BadRequest, "emailRequired", "E-mail field is required");
      }
      // get the first name from the request
      const firstName: string | undefined = req.body.firstName;
      // if first name is undefined
      if (firstName == undefined || firstName.trim().length == 0) {
        // return the validation error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.BadRequest, "firstNameRequired", "First name field is required");
      }
      // get the last name from the request
      const lastName: string | undefined = req.body.lastName;
      // if last name is undefined
      if (lastName == undefined || lastName.trim().length == 0) {
        // return the validation error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.BadRequest, "lastNameRequired", "Last name field is required");
      }
      // get the password from the request
      const password: string | undefined = req.body.password;
      // if password is undefined
      if (password == undefined || password.trim().length == 0) {
        // return the validation error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.BadRequest, "passwordRequired", "Password field is required");
      }
      // create the new user
      const newUser: User = new User(email, firstName, lastName);
      // set the new user password
      newUser.password = password;
      // save user with rabbit
      const savedUser: User | undefined = await handler
        .getRabbitBreeder()
        .sendRequestAndAwaitResponse<User>("userCreate", "userCreateResponse", newUser.toJson(), (data: Record<string, unknown>) => {
          return User.createFromJsonData(data, new User());
        });
      // check if the user was saved
      if (savedUser === undefined) {
        // return the error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.InternalServerError, "error", "User create failed");
      }
      // TODO send email confirmation
      // return the success response
      return RequestHelpers.sendJsonCreated(res);
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(res, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
