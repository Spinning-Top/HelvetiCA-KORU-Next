import type { Request, Response } from "express";
import { ValidationError } from "class-validator";

import type { Dummy } from "@koru/feature-models";
import { DummyController } from "../controllers/index.ts";
import { Endpoint, EndpointMethod, type Handler } from "@koru/microservice";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import type { User } from "@koru/core-models";

export function updateDummyEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/dummies/:id", EndpointMethod.PUT, true, ["dummy.update"]);

  const endpointHandler: (req: Request, res: Response) => void = async (req: Request, res: Response) => {
    try {
      // get the user from the request
      const user: User | undefined = "user" in req ? (req.user as User | undefined) : undefined;
      // check if the user exists
      if (user === undefined) {
        // return an error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.Unauthorized, "unauthorized", "Authentication needed to access this endpoint");
      }

      // create a dummy controller instance
      const dummyController: DummyController = new DummyController(handler);
      // get the user id from the request
      const id: number = Number(req.params.id);
      // if id is not a number
      if (isNaN(id)) {
        // return an error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.BadRequest, "invalidDummyId", "Invalid dummy id");
      }
      // find the dummy by id
      const dummy: Dummy | undefined = await dummyController.getEntityById(id);
      // if dummy is not found
      if (dummy === undefined) {
        // return an error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.NotFound, "notFound", `Dummy with id ${id} not found`);
      }
      // update the dummy from the request
      dummy.updateFromRequest(req);
      // save the updated dummy
      const saveResult: Dummy | ValidationError[] | string = await dummyController.updateEntity(dummy, user);
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
          }))
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
