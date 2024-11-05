// third party
import type { Context } from "hono";

// project
import { type BaseController, Endpoint, EndpointMethod } from "@koru/base-service";
import type { EntityModel } from "@koru/core-models";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";

export function readEntitiesEndpoint<T extends EntityModel, U extends BaseController<T>>(
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
      // get the page from the request
      const page: number | undefined = c.req.query("page") != undefined ? Number(c.req.query("page")) : undefined;
      // get the limit from the request
      const limit: number | undefined = c.req.query("limit") != undefined ? Number(c.req.query("limit")) : undefined;
      // get the search from the request
      const search: string | undefined = c.req.query("search") != undefined ? c.req.query("search") : undefined;
      // get the roles with the given parameters
      const result: { entities: Record<string, unknown>[]; total: number; page: number; limit: number } = await entityController
        .getEntitiesWithParams(
          page,
          limit,
          search,
        );
      // return the roles
      return RequestHelpers.sendJsonResponse(c, result);
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
