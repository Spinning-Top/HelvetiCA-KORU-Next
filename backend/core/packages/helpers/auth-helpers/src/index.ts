// third party
import type { Context, MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";
import { jwt } from "hono/jwt";

// project
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import { User } from "@koru/core-models";

export class AuthHelpers {
  public static getAuthMiddlewares(handler: Handler): MiddlewareHandler[] {
    const jwtMiddleware: MiddlewareHandler = jwt({ secret: handler.getGlobalConfig().auth.jwtSecret });

    const userMiddleware: MiddlewareHandler = createMiddleware(async (c: Context, next) => {
      try {
        const jwtPayload = c.get("jwtPayload") as Record<string, unknown>;
        // get user
        const user: User | undefined = await handler.getRabbitBreeder().sendRequestAndAwaitResponse<User>(
          "userReadRequest",
          "userReadResponse",
          { id: Number(jwtPayload.id) },
          (data: Record<string, unknown>) => {
            return User.createFromJsonData(data, new User());
          },
        );
        if (user !== undefined) {
          // Aggiunge l'utente al contesto in modo che sia disponibile per le route successive
          c.set("user", user);
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
