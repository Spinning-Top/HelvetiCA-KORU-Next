import type { Context } from "hono";

import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import type { User } from "@koru/core-models";

export function profileEndpoint(_handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/profile", EndpointMethod.GET, true);

  const endpointHandler: (c: Context) => void = (c: Context) => {
    try {
      // get the user from the context
      const user: User = c.get("user");
      // return the user from the request
      return RequestHelpers.sendJsonResponse(c, { user });
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
