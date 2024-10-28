import type { Context } from "hono";

import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import type { Role } from "@koru/core-models";
import { RoleController } from "../controllers/index.ts";

export function readRoleEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/roles/:id", EndpointMethod.GET, true, ["role.read.byId"]);

  const endpointHandler: (c: Context) => void = async (c: Context) => {
    try {
      // create a role controller instance
      const roleController: RoleController = new RoleController(handler);
      // get the role id from the request"
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
      // return the role
      return RequestHelpers.sendJsonResponse(c, role.toReadResponse());
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
