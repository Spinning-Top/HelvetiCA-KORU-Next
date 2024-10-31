import type { Context } from "hono";

import type { CronJob } from "@koru/core-models";
import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";

import { CronJobController } from "../controllers/index.ts";

export function readCronJobEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/cron-jobs/:id", EndpointMethod.GET, true, ["cronJob.read.byId"]);

  const endpointHandler: (c: Context) => void = async (c: Context) => {
    try {
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
      const cronJop: CronJob | undefined = await cronJobController.getEntityById(id);
      // if cron job is not found
      if (cronJop === undefined) {
        // return an error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.NotFound, "notFound", `Cron job with id ${id} not found`);
      }
      // return the cron job
      return RequestHelpers.sendJsonResponse(c, cronJop.toReadResponse());
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
