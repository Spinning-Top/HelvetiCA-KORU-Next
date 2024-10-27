import type { Context, MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";
import type { Hono } from "hono";
import { jwt } from "hono/jwt";
import type { JWTPayload } from "hono/utils/jwt/types";
import { verify } from "hono/jwt";

import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import { RabbitHelpers } from "@koru/rabbit-helpers";
import type { RabbitBreeder } from "@koru/rabbit-breeder";
import { User } from "@koru/core-models";

export class AuthHelpers {
  public static getAuthMiddleware(handler: Handler): MiddlewareHandler {
    return createMiddleware(async (c: Context, next) => {
      const authHeader = c.req.header("Authorization");
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return RequestHelpers.sendJsonError(c, HttpStatusCode.Unauthorized, "error", "Invalid or missing token");
      }

      const token: string = authHeader.split(' ')[1];

      try {
        const payload: JWTPayload = await verify(token, handler.getGlobalConfig().auth.jwtSecret);

        if (!payload) {
          return RequestHelpers.sendJsonError(c, HttpStatusCode.Unauthorized, "error", "User authentication failed");
        }

        c.set('user', payload);
        await next();
      } catch (error: unknown) {
        return RequestHelpers.sendJsonError(
          c,
          HttpStatusCode.InternalServerError,
          "error",
          "An error occured",
          error instanceof Error ? { details: error.message } : undefined
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
          "Authentication needed to access this endpoint"
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
            "You don't have permission to access this endpoint"
          );
        }
      }

      c.set('user', user);
      await next();
    });
  }

  public static initJwtMiddleware(jwtSecret: string, app: Hono, rabbitBreeder: RabbitBreeder): void {
    const jwtMiddleware: MiddlewareHandler = jwt({ secret: jwtSecret });

    const userMiddleware: MiddlewareHandler = async (c: Context, next) => {
      try {
        const jwtPayload = c.get('jwtPayload') as Record<string, unknown>;
        const user = await RabbitHelpers.getUserByField('id', Number(jwtPayload.id), rabbitBreeder);

        if (user) {
          // Aggiunge l'utente al contesto in modo che sia disponibile per le route successive
          c.set('user', user.toReadResponse());
          await next();
        } else {
          return c.json(
            { error: 'Unauthorized', message: 'User not found' },
            401
          );
        }
      } catch (err) {
        return c.json(
          { error: 'Internal Server Error', message: err instanceof Error ? err.message : 'Unknown error' },
          500
        );
      }
    };

    // Applica i middleware JWT e User su tutte le route che richiedono autenticazione
    app.use('*', jwtMiddleware, userMiddleware);
  }

  /*
  public static initPassport(jwtSecret: string, express: Express, rabbitBreeder: RabbitBreeder): void {
    passport.use(
      new JwtStrategy(
        {
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          secretOrKey: jwtSecret,
        },
        async (jwt_payload: Record<string, unknown>, done: (arg0: unknown, arg1: unknown) => unknown) => {
          try {
            const user: User | undefined = await RabbitHelpers.getUserByField("id", Number(jwt_payload.id), rabbitBreeder);
            if (user != undefined) {
              return done(null, user.toReadResponse());
            } else {
              return done(null, false);
            }
          } catch (err) {
            return done(err, false);
          }
        },
      ),
    );

    express.use(passport.initialize());
  }
  */
}
