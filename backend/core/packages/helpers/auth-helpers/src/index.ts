import type { Context, MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";
import { jwt } from "hono/jwt";

import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import { RabbitHelpers } from "@koru/rabbit-helpers";

export class AuthHelpers {
  public static getAuthMiddlewares(handler: Handler): MiddlewareHandler[] {
    const jwtMiddleware: MiddlewareHandler = jwt({ secret: handler.getGlobalConfig().auth.jwtSecret });

    const userMiddleware: MiddlewareHandler = createMiddleware(async (c: Context, next) => {
      try {
        const jwtPayload = c.get("jwtPayload") as Record<string, unknown>;
        const user = await RabbitHelpers.getUserByField("id", Number(jwtPayload.id), handler.getRabbitBreeder());

        if (user) {
          // Aggiunge l'utente al contesto in modo che sia disponibile per le route successive
          c.set("user", user.toReadResponse());
          await next();
        } else {
          return RequestHelpers.sendJsonError(c, HttpStatusCode.Unauthorized, "unauthorized", "Authentication needed to access this endpoint");
        }
      } catch (error: unknown) {
        return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
      }
    });

    return [jwtMiddleware, userMiddleware];
  }
}
