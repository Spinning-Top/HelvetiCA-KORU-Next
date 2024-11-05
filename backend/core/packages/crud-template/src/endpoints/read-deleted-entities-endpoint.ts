// third party
import type { Context } from "hono";

// project
import { type BaseController, Endpoint, EndpointMethod } from "@koru/base-service";
import type { EntityModel } from "@koru/core-models";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";

export function readDeletedEntitiesEndpoint<T extends EntityModel, U extends BaseController<T>>(
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
      // get the entities with the given parameters
      const entities: T[] = await entityController.getDeletedEntities();
      // return the entities
      return RequestHelpers.sendJsonResponse(c, { entities: entities });
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
