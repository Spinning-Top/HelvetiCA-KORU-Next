import type { Request, Response } from "express";

import type { Dummy } from "@koru/feature-models";
import { DummyController } from "../controllers/index.ts";
import { Endpoint, EndpointMethod, type Handler } from "@koru/microservice";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import type { User } from "@koru/core-models";

export function deleteDummyEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/dummies/:id", EndpointMethod.DELETE, true, ["dummy.delete"]);

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
      // get the dummy id from the request
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
      // remove the dummy
      await dummyController.deleteEntity(dummy, user);
      // return the success response
      return RequestHelpers.sendJsonDeleted(res);
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(res, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
