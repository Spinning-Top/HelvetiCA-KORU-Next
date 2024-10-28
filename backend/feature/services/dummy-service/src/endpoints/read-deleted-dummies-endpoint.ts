import type { Context } from "hono";

import type { Dummy } from "@koru/feature-models";
import { DummyController } from "../controllers/index.ts";
import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";

export function readDeletedDummiesEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/dummies/deleted", EndpointMethod.GET, true, ["dummy.read.all"]);

  const endpointHandler: (c: Context) => void = async (c: Context) => {
    try {
      // create a dummy controller instance
      const dummyController: DummyController = new DummyController(handler);
      // get the users with the given parameters
      const dummies: Dummy[] = await dummyController.getDeletedEntities();
      // return the users
      return RequestHelpers.sendJsonResponse(c, { entities: dummies });
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
