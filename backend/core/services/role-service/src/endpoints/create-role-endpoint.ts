import type { Context } from "hono";
import { ValidationError } from "class-validator";

import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import { Role, type User } from "@koru/core-models";
import { RoleController } from "../controllers/index.ts";

export function createRoleEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/roles", EndpointMethod.POST, true, ["role.create"]);

  const endpointHandler: (c: Context) => void = async (c: Context) => {
    try {
      // get the user from the context
      const user: User | undefined = c.get("user");
      // check if the user exists
      if (user === undefined) {
        // return an error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.Unauthorized, "unauthorized", "Authentication needed to access this endpoint");
      }

      // create a role controller instance
      const roleController: RoleController = new RoleController(handler);
      // get the body from the request
      const body: Record<string, unknown> = await c.req.parseBody();
      // create the new role from the request
      const newRole: Role = Role.createFromRequest(body, new Role());
      // save the new role
      const saveResult: Role | ValidationError[] | string = await roleController.createEntity(newRole, user);
      // if the save result is an array of validation errors
      if (Array.isArray(saveResult) && saveResult.length > 0 && saveResult[0] instanceof ValidationError) {
        // return the validation errors
        return RequestHelpers.sendJsonError(
          c,
          HttpStatusCode.BadRequest,
          "validationError",
          "Validation failed",
          saveResult.map((error) => ({
            property: error.property,
            constraints: error.constraints,
          })),
        );
      }
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
