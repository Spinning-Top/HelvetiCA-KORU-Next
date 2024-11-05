// third party
import type { Context } from "hono";
import { ValidationError } from "class-validator";

// project
import { type BaseController, Endpoint, EndpointMethod } from "@koru/base-service";
import type { EntityModel, User } from "@koru/core-models";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";

export function updateEntityEndpoint<T extends EntityModel, U extends BaseController<T>>(
  handler: Handler,
  url: string,
  allowedPermissions: string[],
  ControllerClass: new (handler: Handler) => U,
): Endpoint {
  const endpoint: Endpoint = new Endpoint(url, EndpointMethod.PUT, true, allowedPermissions);

  const endpointHandler: (c: Context) => void = async (c: Context) => {
    try {
      // get the user from the context
      const user: User = c.get("user");
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
      // get the body from the request
      const body: Record<string, unknown> = await c.req.parseBody();
      // update the entity from the request
      entity.updateFromRequest(body);
      // save the updated entity
      const saveResult: T | ValidationError[] | string = await entityController.updateEntity(entity, user);
      // if the save result is an array of validation errors
      if (Array.isArray(saveResult) && saveResult.length > 0 && saveResult[0] instanceof ValidationError) {
        // return the validation errors
        return RequestHelpers.sendJsonError(
          c,
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
      return RequestHelpers.sendJsonUpdated(c);
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
