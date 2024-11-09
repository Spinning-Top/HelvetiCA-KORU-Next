// third party
import type { Context } from "hono";

// project
import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";

// local
import type { GatewayService } from "../gateway-service.ts";

export function wildcardEndpoint(gatewayServices: GatewayService[], handler: Handler): Endpoint {
  const endpoint: Endpoint = new Endpoint("*", EndpointMethod.ALL);

  const endpointHandler: (c: Context) => void = async (c: Context) => {
    try {
      // get the method and url
      const method = c.req.method;
      const url = c.req.url;
      // log the request
      handler.getLog().info(`Received ${method} request for ${url}`);

      // get the endpoint and service
      const urlObject: URL = new URL(url);
      const endpointUrl: string = urlObject.pathname;

      let selectedGatewayService: GatewayService | undefined = undefined;
      let selectedEndpoint: Endpoint | undefined = undefined;
      let urlToService: string = "";

      // find the endpoint that matches the request with the connected service
      for (const gatewayService of gatewayServices) {
        for (const endpoint of gatewayService.getEndpoints()) {
          const params: Record<string, string> | undefined = RequestHelpers.matchRoute(endpointUrl, endpoint.getFullUrl());
          if (params !== undefined && endpoint.getMethod() === method) {
            selectedGatewayService = gatewayService;
            selectedEndpoint = endpoint;
            urlToService = selectedEndpoint.getUrl();

            for (const [key, value] of Object.entries(params)) {
              urlToService = urlToService.replace(`:${key}`, value);
            }
            break;
          }
        }
        if (selectedGatewayService !== undefined) break;
      }

      // if the endpoint is not found, return a 404
      if (selectedGatewayService === undefined || selectedEndpoint === undefined) {
        handler.getLog().error(`Endpoint not found for ${method} request to ${url}`);
        return RequestHelpers.sendJsonError(c, HttpStatusCode.NotFound, "notFound", "Endpoint not found");
      }

      // copy original headers
      const headers = new Headers(c.req.raw.headers);
      // get the body
      const body: Record<string, unknown> = await c.req.parseBody();

      // filter out non-string values
      const formData = Object.fromEntries(
        Object.entries(body).filter(([_, value]) => typeof value === "string"),
      );

      // convert the body to the correct format
      const data = headers.get("Content-Type") === "application/x-www-form-urlencoded"
        ? new URLSearchParams(formData as Record<string, string>).toString()
        : JSON.stringify(body);

      // get the query parameters
      const params = new URLSearchParams(c.req.query()).toString();

      // create the service request URL
      const requestToServiceUrl = new URL(selectedGatewayService.getServiceRoot() + urlToService);
      // add the query parameters
      requestToServiceUrl.search = params;

      // create the fetch options for the request to the service
      const fetchOptions: RequestInit = {
        method: selectedEndpoint.getMethod(),
        headers,
        body: [EndpointMethod.POST, EndpointMethod.PUT].includes(selectedEndpoint.getMethod()) ? data : undefined,
      };

      // send the request to the service and wait for the response
      const response = await fetch(requestToServiceUrl.toString(), fetchOptions);
      // get the response body
      const responseBody = await response.json();
      // send the response back to the client
      return RequestHelpers.sendJsonResponse(c, responseBody, response.status);
    } catch (error) {
      if (error instanceof Response && error.status) {
        // if the error is a response, return the status and the body
        return RequestHelpers.sendJsonError(c, error.status, "error", await error.json());
      } else {
        console.error(error);
        // if the error is not a response, return a 500 error
        return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
      }
    }
  };

  endpoint.setHandler(endpointHandler);

  return endpoint;
}
