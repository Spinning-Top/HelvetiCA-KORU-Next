import type { Context } from "hono";
import { ValidationError } from "class-validator";

import { CronJob, type User } from "@koru/core-models";
import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";

import { CronJobController } from "../controllers/index.ts";

export function createCronJobEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/cron-jobs", EndpointMethod.POST, true, ["cronJob.create"]);

  const endpointHandler: (c: Context) => void = async (c: Context) => {
    try {
      // get the user from the context
      const user: User = c.get("user");
      // create a cron job controller instance
      const cronJobController: CronJobController = new CronJobController(handler);
      // get the body from the request
      const body: Record<string, unknown> = await c.req.parseBody();
      // create the new cron job from the request
      const newCronJob: CronJob = CronJob.createFromRequest(body, new CronJob());
      // save the new cron job
      const saveResult: CronJob | ValidationError[] | string = await cronJobController.createEntity(newCronJob, user);
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
