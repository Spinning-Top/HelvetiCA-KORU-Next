import type { Context } from "hono";

import { type BaseController, Endpoint, EndpointMethod } from "@koru/base-service";
import type { EntityModel } from "@koru/core-models";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";

export function readEntityEndpoint<T extends EntityModel, U extends BaseController<T>>(
  handler: Handler,
  url: string,
  allowedPermissions: string[],
  ControllerClass: new (handler: Handler) => U,
): Endpoint {
  const endpoint: Endpoint = new Endpoint(url, EndpointMethod.GET, true, allowedPermissions);

  const endpointHandler: (c: Context) => void = async (c: Context) => {
    try {
      // create an entity controller instance
      const entityController: U = new ControllerClass(handler);
      // get the entity id from the request
      const id: number = Number(c.req.param("id"));
      // if id is not a number
      if (isNaN(id)) {
        // return an error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.BadRequest, "invalidId", "Invalid id provided");
      }
      // find the entity by id
      const entity: T | undefined = await entityController.getEntityById(id);
      // if entity is not found
      if (entity === undefined) {
        // return an error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.NotFound, "notFound", `Entity with id ${id} not found`);
      }
      // return the entity
      return RequestHelpers.sendJsonResponse(c, entity.toReadResponse());
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}