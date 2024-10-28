import type { Context } from "hono";

import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import type { Role } from "@koru/core-models";
import { RoleController } from "../controllers/index.ts";

export function readDeletedRolesEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/roles/deleted", EndpointMethod.GET, true, ["role.read.all"]);

  const endpointHandler: (c: Context) => void = async (c: Context) => {
    try {
      // create a role controller instance
      const roleController: RoleController = new RoleController(handler);
      // get the users with the given parameters
      const roles: Role[] = await roleController.getDeletedEntities();
      // return the users
      return RequestHelpers.sendJsonResponse(c, { entities: roles });
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
