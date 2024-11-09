// third party
import type { Context } from "hono";

// project
import { Endpoint, EndpointMethod } from "@koru/base-service";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";

export function faviconEndpoint(): Endpoint {
  const endpoint: Endpoint = new Endpoint("/favicon.ico", EndpointMethod.GET);

  const endpointHandler: (c: Context) => void = async (c: Context) => {
    try {
      const favicon = await Deno.readFile("./assets/favicon.ico");
      return c.body(favicon, 200, { "Content-Type": "image/x-icon" });
    } catch (error) {
      console.error(error);
      return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
