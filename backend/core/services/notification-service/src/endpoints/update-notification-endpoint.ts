import type { Context } from "hono";
import { ValidationError } from "class-validator";

import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import type { Notification, User } from "@koru/core-models";
import { NotificationController } from "../controllers/index.ts";

export function updateNotificationEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/notifications/:id", EndpointMethod.PUT, true, ["notification.update"]);

  const endpointHandler: (c: Context) => void = async (c: Context) => {
    try {
      // get the user from the context
      const user: User = c.get("user");
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
      // get the body from the request
      const body: Record<string, unknown> = await c.req.parseBody();
      // update the notification from the request
      notification.updateFromRequest(body);
      // save the updated notification
      const saveResult: Notification | ValidationError[] | string = await notificationController.updateEntity(notification, user);
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
