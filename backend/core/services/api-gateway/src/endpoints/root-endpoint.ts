// third party
import type { Context } from "hono";

// project
import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";

export function rootEndpoint(handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("/", EndpointMethod.GET);

  const endpointHandler: (c: Context) => void = (c: Context) => {
    try {
      // favicon link
      c.header("Link", '</favicon.ico>; rel="icon"');
      return c.json({
        name: "KORU API",
        version: handler.getGlobalConfig().koru.version,
      });
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
