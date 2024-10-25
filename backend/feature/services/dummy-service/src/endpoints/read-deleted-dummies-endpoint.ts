import type { Request, Response } from "express";

import type { Dummy } from "@koru/feature-models";
import { DummyController } from "../controllers/index.ts";
import { Endpoint, EndpointMethod, type Handler } from "@koru/microservice";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import type { User } from "@koru/core-models";

export function readDeletedDummiesEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/dummies/deleted", EndpointMethod.GET, true, ["dummy.read.all"]);

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
      // get the users with the given parameters
      const dummies: Dummy[] = await dummyController.getDeletedEntities();
      // return the users
      return RequestHelpers.sendJsonResponse(res, { entities: dummies });
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(res, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
