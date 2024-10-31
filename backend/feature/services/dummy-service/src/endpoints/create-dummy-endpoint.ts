import type { Context } from "hono";
import { ValidationError } from "class-validator";

import { Dummy } from "@koru/feature-models";
import { DummyController } from "../controllers/index.ts";
import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import type { User } from "@koru/core-models";

export function createDummyEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/dummies", EndpointMethod.POST, true, ["dummy.create"]);

  const endpointHandler: (c: Context) => void = async (c: Context) => {
    try {
      // get the user from the context
      const user: User = c.get("user");
      // create a dummy controller instance
      const dummyController: DummyController = new DummyController(handler);
      // get the body from the request
      const body: Record<string, unknown> = await c.req.parseBody();
      // create the new dummy from the request
      const newDummy: Dummy = Dummy.createFromRequest(body, new Dummy());
      // save the new dummy
      const saveResult: Dummy | ValidationError[] | string = await dummyController.createEntity(newDummy, user);
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
