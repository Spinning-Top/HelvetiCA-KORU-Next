import type { Request, Response } from "express";

import { Endpoint, EndpointMethod, type Handler } from "@koru/microservice";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import type { Role } from "@koru/core-models";
import { RoleController } from "../controllers/index.ts";

export function readDeletedRolesEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/roles/deleted", EndpointMethod.GET, true, ["role.read.all"]);

  const endpointHandler: (req: Request, res: Response) => void = async (_req: Request, res: Response) => {
    try {
      // create a role controller instance
      const roleController: RoleController = new RoleController(handler);
      // get the users with the given parameters
      const roles: Role[] = await roleController.getDeletedEntities();
      // return the users
      return RequestHelpers.sendJsonResponse(res, { entities: roles });
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(res, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
