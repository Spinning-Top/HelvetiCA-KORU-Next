import type { Context, MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";
import { jwt } from "hono/jwt";
import type { JWTPayload } from "hono/utils/jwt/types";
import { verify } from "hono/jwt";

import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import { RabbitHelpers } from "@koru/rabbit-helpers";
import { User } from "@koru/core-models";

export class AuthHelpers {
  public static getAuthMiddleware(handler: Handler): MiddlewareHandler {
    return createMiddleware(async (c: Context, next) => {
      const authHeader = c.req.header("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return RequestHelpers.sendJsonError(c, HttpStatusCode.Unauthorized, "error", "Invalid or missing token");
      }

      const token: string = authHeader.split(" ")[1];

      try {
        const payload: JWTPayload = await verify(token, handler.getGlobalConfig().auth.jwtSecret);

        if (!payload) return RequestHelpers.sendJsonError(c, HttpStatusCode.Unauthorized, "error", "User authentication failed");

        c.set("jwtPayload", payload);
        await next();
      } catch (error: unknown) {
        return RequestHelpers.sendJsonError(
          c,
          HttpStatusCode.InternalServerError,
          "error",
          "An error occured",
          error instanceof Error ? { details: error.message } : undefined,
        );
      }
    });
  }

  public static getUserMiddleware(permissions: string[] = []): MiddlewareHandler {
    return createMiddleware(async (c: Context, next) => {
      let user: User | undefined = undefined;

      // Verifica la presenza dell'intestazione "x-koru-user"
      const userHeader = c.req.header("x-koru-user");
      if (userHeader) {
        try {
          user = User.createFromJsonData(JSON.parse(userHeader), new User());
        } catch (_error: unknown) {
          return RequestHelpers.sendJsonError(c, HttpStatusCode.BadRequest, "error", "Invalid user data");
        }
      }

      // Controlla se l'utente è definito
      if (!user) {
        return RequestHelpers.sendJsonError(
          c,
          HttpStatusCode.Unauthorized,
          "unauthorized",
          "Authentication needed to access this endpoint",
        );
      }

      // Verifica i permessi, se necessario
      if (permissions.length > 0) {
        const hasPermission = permissions.some((permission) => user?.hasPermission(permission) ?? false);
        if (!hasPermission) {
          return RequestHelpers.sendJsonError(
            c,
            HttpStatusCode.Forbidden,
            "forbidden",
            "You don't have permission to access this endpoint",
          );
        }
      }

      c.set("user", user);
      await next();
    });
  }

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
