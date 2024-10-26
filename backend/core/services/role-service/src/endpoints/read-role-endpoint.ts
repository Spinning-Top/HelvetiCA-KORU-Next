import type { Request, Response } from "express";

import { Endpoint, EndpointMethod, type Handler } from "@koru/microservice";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import type { Role } from "@koru/core-models";
import { RoleController } from "../controllers/index.ts";

export function readRoleEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/roles/:id", EndpointMethod.GET, true, ["role.read.byId"]);

  const endpointHandler: (req: Request, res: Response) => void = async (req: Request, res: Response) => {
    try {
      // create a role controller instance
      const roleController: RoleController = new RoleController(handler);
      // get the role id from the request
      const id: number = Number(req.params.id);
      // if id is not a number
      if (isNaN(id)) {
        // return an error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.BadRequest, "invalidRoleId", "Invalid role id");
      }
      // find the role by id
      const role: Role | undefined = await roleController.getEntityById(id);
      // if role is not found
      if (role === undefined) {
        // return an error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.NotFound, "notFound", `Role with id ${id} not found`);
      }
      // return the role
      return RequestHelpers.sendJsonResponse(res, role.toReadResponse());
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(res, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
