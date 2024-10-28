import type { Context } from "hono";

import type { Dummy } from "@koru/feature-models";
import { DummyController } from "../controllers/index.ts";
import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";

export function readDummyEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/dummies/:id", EndpointMethod.GET, true, ["dummy.read.byId"]);

  const endpointHandler: (c: Context) => void = async (c: Context) => {
    try {
      // create a dummy controller instance
      const dummyController: DummyController = new DummyController(handler);
      // get the dummy id from the request
      const id: number = Number(c.req.param("id"));
      // if id is not a number
      if (isNaN(id)) {
        // return an error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.BadRequest, "invalidDummyId", "Invalid dummy id");
      }
      // find the dummy by id
      const dummy: Dummy | undefined = await dummyController.getEntityById(id);
      // if dummy is not found
      if (dummy === undefined) {
        // return an error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.NotFound, "notFound", `Dummy with id ${id} not found`);
      }
      // return the dummy
      return RequestHelpers.sendJsonResponse(c, dummy.toReadResponse());
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
