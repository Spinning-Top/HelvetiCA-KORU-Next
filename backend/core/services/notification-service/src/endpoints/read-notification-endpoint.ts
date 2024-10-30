import type { Context } from "hono";

import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import type { Notification } from "@koru/core-models";
import { NotificationController } from "../controllers/index.ts";

export function readNotificationEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/notifications/:id", EndpointMethod.GET, true, ["notification.read.byId"]);

  const endpointHandler: (c: Context) => void = async (c: Context) => {
    try {
      // create a notification controller instance
      const notificationController: NotificationController = new NotificationController(handler);
      // get the notification id from the request
      const id: number = Number(c.req.param("id"));
      // if id is not a number
      if (isNaN(id)) {
        // return an error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.BadRequest, "invalidNotificationId", "Invalid notification id");
      }
      // find the notification by id
      const notification: Notification | undefined = await notificationController.getEntityById(id);
      // if notification is not found
      if (notification === undefined) {
        // return an error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.NotFound, "notFound", `Notification with id ${id} not found`);
      }
      // return the notification
      return RequestHelpers.sendJsonResponse(c, notification.toReadResponse());
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
