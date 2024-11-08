import type { Context } from "hono";

import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import { NotificationController } from "../controllers/index.ts";

export function readNotificationsEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/notifications", EndpointMethod.GET, true, ["notification.read.all"]);

  const endpointHandler: (c: Context) => void = async (c: Context) => {
    try {
      // create a notification controller instance
      const notificationController: NotificationController = new NotificationController(handler);
      // get the page from the request
      const page: number | undefined = c.req.query("page") != undefined ? Number(c.req.query("page")) : undefined;
      // get the limit from the request
      const limit: number | undefined = c.req.query("limit") != undefined ? Number(c.req.query("limit")) : undefined;
      // get the search from the request
      const search: string | undefined = c.req.query("search") != undefined ? c.req.query("search") : undefined;
      // get the notifications with the given parameters
      const result: { entities: Record<string, unknown>[]; total: number; page: number; limit: number } = await notificationController
        .getEntitiesWithParams(page, limit, search);
      // return the notifications
      return RequestHelpers.sendJsonResponse(c, result);
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
