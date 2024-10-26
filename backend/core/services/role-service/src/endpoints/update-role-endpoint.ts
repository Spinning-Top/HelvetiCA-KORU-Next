import type { Request, Response } from "express";
import { ValidationError } from "class-validator";

import { Endpoint, EndpointMethod, type Handler } from "@koru/microservice";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import type { Role, User } from "@koru/core-models";
import { RoleController } from "../controllers/index.ts";

export function updateRoleEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/roles/:id", EndpointMethod.PUT, true, ["role.update"]);

  const endpointHandler: (req: Request, res: Response) => void = async (req: Request, res: Response) => {
    try {
      // get the user from the request
      const user: User | undefined = "user" in req ? req.user as User | undefined : undefined;
      // check if the user exists
      if (user === undefined) {
        // return an error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.Unauthorized, "unauthorized", "Authentication needed to access this endpoint");
      }

      // create a role controller instance
      const roleController: RoleController = new RoleController(handler);
      // get the user id from the request
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
      // update the role from the request
      role.updateFromRequest(req);
      // save the updated role
      const saveResult: Role | ValidationError[] | string = await roleController.updateEntity(role, user);
      // if the save result is an array of validation errors
      if (Array.isArray(saveResult) && saveResult.length > 0 && saveResult[0] instanceof ValidationError) {
        // return the validation errors
        return RequestHelpers.sendJsonError(
          res,
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
      return RequestHelpers.sendJsonUpdated(res);
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(res, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
