import type { Context } from "hono";
import { ValidationError } from "class-validator";

import { type BaseController, Endpoint, EndpointMethod } from "@koru/base-service";
import type { EntityModel, User } from "@koru/core-models";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";

export function createEntityEndpoint<T extends EntityModel, U extends BaseController<T>>(
  handler: Handler,
  url: string,
  allowedPermissions: string[],
  EntityModelClass: { new (): T; createFromRequest: (body: Record<string, unknown>, entity: T) => T },
  ControllerClass: new (handler: Handler) => U,
): Endpoint {
  const endpoint: Endpoint = new Endpoint(url, EndpointMethod.POST, true, allowedPermissions);

  const endpointHandler: (c: Context) => void = async (c: Context) => {
    try {
      // get the user from the context
      const user: User = c.get("user");
      // create an entity controller instance
      const entityController: U = new ControllerClass(handler);
      // get the body from the request
      const body: Record<string, unknown> = await c.req.parseBody();
      // create the new entity from the request
      const newEntity: T = EntityModelClass.createFromRequest(body, new EntityModelClass());
      // save the new entity
      const saveResult: T | ValidationError[] | string = await entityController.createEntity(newEntity, user);
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
      return RequestHelpers.sendJsonCreated(c);
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
