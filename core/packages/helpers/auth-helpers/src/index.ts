import type { Express, NextFunction, Request, Response } from "express";
import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";

import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import { RabbitHelpers } from "@koru/rabbit-helpers";
import type { RabbitBreeder } from "@koru/rabbit-breeder";
import { User } from "@koru/core-models";

export class AuthHelpers {
  public static getAuthMiddleware(): (req: Request, res: Response, next: NextFunction) => void {
    return function (req: Request, res: Response, next: NextFunction): void {
      passport.authenticate(
        "jwt",
        { session: false },
        (err: Error | undefined, user: Record<string, unknown> | false, info: AuthError | undefined) => {
          if (err) {
            return RequestHelpers.sendJsonError(res, HttpStatusCode.InternalServerError, "error", err.message);
          }
          if (!user) {
            return RequestHelpers.sendJsonError(res, HttpStatusCode.Unauthorized, "invalidToken", "Invalid or missing token", {
              message: info?.message ?? "",
            });
          }
          req.user = user;
          next();
        },
      )(req, res, next);
    };
  }

  public static getUserMiddleware(permissions: string[] = []): (req: Request, res: Response, next: NextFunction) => void {
    return function (req: Request, res: Response, next: NextFunction): void {
      let user: User | undefined = undefined;
      if ("x-koru-user" in req.headers) {
        const userHeader = req.headers["x-koru-user"];
        if (typeof userHeader === "string") {
          user = User.createFromJsonData(JSON.parse(userHeader), new User());
        }
      }

      if (user === undefined) {
        RequestHelpers.sendJsonError(res, HttpStatusCode.Unauthorized, "unauthorized", "Authentication needed to access this endpoint");
        return;
      }

      if (permissions.length > 0) {
        const hasPermission: boolean = permissions.some((permission) => user?.hasPermission(permission) ?? false);
        if (hasPermission === false) {
          RequestHelpers.sendJsonError(res, HttpStatusCode.Forbidden, "forbidden", "You don't have permission to access this endpoint");
          return;
        }
      }

      req.user = user;
      next();
    };
  }

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
}

interface AuthError {
  message: string;
}
