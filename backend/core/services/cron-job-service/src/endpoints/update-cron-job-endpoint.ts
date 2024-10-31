import type { Context } from "hono";
import { ValidationError } from "class-validator";

import type { CronJob, User } from "@koru/core-models";
import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";

import { CronJobController } from "../controllers/index.ts";

export function updateCronJobEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/cron-jobs/:id", EndpointMethod.PUT, true, ["cronJob.update"]);

  const endpointHandler: (c: Context) => void = async (c: Context) => {
    try {
      // get the user from the context
      const user: User = c.get("user");
      // create a cron job controller instance
      const cronJobController: CronJobController = new CronJobController(handler);
      // get the cron job id from the request
      const id: number = Number(c.req.param("id"));
      // if id is not a number
      if (isNaN(id)) {
        // return an error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.BadRequest, "invalidCronJobId", "Invalid cron job id");
      }
      // find the cron job by id
      const cronJob: CronJob | undefined = await cronJobController.getEntityById(id);
      // if cron job is not found
      if (cronJob === undefined) {
        // return an error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.NotFound, "notFound", `Cron job with id ${id} not found`);
      }
      // get the body from the request
      const body: Record<string, unknown> = await c.req.parseBody();
      // update the cron job from the request
      cronJob.updateFromRequest(body);
      // save the updated cron job
      const saveResult: CronJob | ValidationError[] | string = await cronJobController.updateEntity(cronJob, user);
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
