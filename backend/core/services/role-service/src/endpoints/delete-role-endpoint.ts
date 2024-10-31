import type { Context } from "hono";

import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import type { Role, User } from "@koru/core-models";
import { RoleController } from "../controllers/index.ts";

export function deleteRoleEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/roles/:id", EndpointMethod.DELETE, true, ["role.delete"]);

  const endpointHandler: (c: Context) => void = async (c: Context) => {
    try {
      // get the user from the context
      const user: User = c.get("user");
      // create a role controller instance
      const roleController: RoleController = new RoleController(handler);
      // get the role id from the request
      const id: number = Number(c.req.param("id"));
      // if id is not a number
      if (isNaN(id)) {
        // return an error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.BadRequest, "invalidRoleId", "Invalid role id");
      }
      // find the role by id
      const role: Role | undefined = await roleController.getEntityById(id);
      // if role is not found
      if (role === undefined) {
        // return an error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.NotFound, "notFound", `Role with id ${id} not found`);
      }
      // remove the role
      await roleController.deleteEntity(role, user);
      // return the success response
      return RequestHelpers.sendJsonDeleted(c);
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
