import type { Request, Response } from "express";

import { Endpoint, EndpointMethod, type Handler } from "@koru/microservice";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import type { User } from "@koru/core-models";

export function profileEndpoint(_handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/profile", EndpointMethod.GET, true);

  const endpointHandler: (req: Request, res: Response) => void = (req: Request, res: Response) => {
    try {
      // get the user from the request
      const user: User | undefined = "user" in req ? req.user as User | undefined : undefined;
      // check if the user exists
      if (user === undefined) {
        // return an error
        return RequestHelpers.sendJsonError(res, HttpStatusCode.Unauthorized, "unauthorized", "Authentication needed to access this endpoint");
      }
      // return the user from the request
      return RequestHelpers.sendJsonResponse(res, { user });
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(res, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
