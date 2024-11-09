// third party
import type { Context, MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";
import { jwt } from "hono/jwt";

// project
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import { User } from "@koru/core-entities";

export class AuthHelpers {
  public static getAuthMiddlewares(handler: Handler): MiddlewareHandler[] {
    // create jwt middleware
    const jwtMiddleware: MiddlewareHandler = jwt({ secret: handler.getGlobalConfig().auth.jwtSecret });

    // create user middleware
    const userMiddleware: MiddlewareHandler = createMiddleware(async (c: Context, next) => {
      try {
        // get jwt payload
        const jwtPayload = c.get("jwtPayload") as Record<string, unknown>;
        // get user via rabbitmq
        const user: User | undefined = await handler.getRabbitBreeder().sendRequestAndAwaitResponse<User>(
          "userReadRequest",
          "userReadResponse",
          { id: Number(jwtPayload.id) },
          (data: Record<string, unknown>) => {
            return User.fromJson(data, User);
          },
        );
        // check if user is not valid
        if (user == undefined || Object.keys(user).includes("id") === false) {
          return RequestHelpers.sendJsonError(c, HttpStatusCode.Unauthorized, "unauthorized", "Authentication needed to access this endpoint");
        }
        // otherwise, add user to context so it is available for subsequent routes
        c.set("user", user);
        // continue to next middleware
        await next();
      } catch (error: unknown) {
        // handle error sending json error response
        return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
      }
    });

    // return middlewares
    return [jwtMiddleware, userMiddleware];
  }
}
