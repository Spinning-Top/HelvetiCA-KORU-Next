import type { Request, Response } from "express";

import { DummyController } from "../controllers/index.ts";
import { Endpoint, EndpointMethod, type Handler } from "@koru/microservice";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import type { User } from "@koru/core-models";

export function readDummiesEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/dummies", EndpointMethod.GET, true, ["dummy.read.all"]);

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
      // get the page from the request
      const page: number | undefined = req.query.page != undefined ? Number(req.query.page) : undefined;
      // get the limit from the request
      const limit: number | undefined = req.query.limit != undefined ? Number(req.query.limit) : undefined;
      // get the search from the request
      const search: string | undefined = req.query.search != undefined ? req.query.search.toString() : undefined;
      // get the users with the given parameters
      const result: { entities: Record<string, unknown>[]; total: number; page: number; limit: number } = await dummyController.getEntitiesWithParams(
        page,
        limit,
        search
      );
      // return the users
      return RequestHelpers.sendJsonResponse(res, result);
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(res, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
