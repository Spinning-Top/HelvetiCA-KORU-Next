import type { Context } from "hono";
import { ValidationError } from "class-validator";

import type { Dummy } from "@koru/feature-models";
import { DummyController } from "../controllers/index.ts";
import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import type { User } from "@koru/core-models";

export function updateDummyEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/dummies/:id", EndpointMethod.PUT, true, ["dummy.update"]);

  const endpointHandler: (c: Context) => void = async (c: Context) => {
    try {
      // get the user from the context
      const user: User = c.get("user");
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
      // get the body from the request
      const body: Record<string, unknown> = await c.req.parseBody();
      // update the dummy from the request
      dummy.updateFromRequest(body);
      // save the updated dummy
      const saveResult: Dummy | ValidationError[] | string = await dummyController.updateEntity(dummy, user);
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
