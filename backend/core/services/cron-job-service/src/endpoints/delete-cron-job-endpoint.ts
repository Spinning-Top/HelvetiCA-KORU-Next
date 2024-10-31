import type { Context } from "hono";

import type { CronJob, User } from "@koru/core-models";
import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";

import { CronJobController } from "../controllers/index.ts";

export function deleteCronJobEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/cron-jobs/:id", EndpointMethod.DELETE, true, ["cronJob.delete"]);

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
      // remove the cron job
      await cronJobController.deleteEntity(cronJob, user);
      // return the success response
      return RequestHelpers.sendJsonDeleted(c);
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
