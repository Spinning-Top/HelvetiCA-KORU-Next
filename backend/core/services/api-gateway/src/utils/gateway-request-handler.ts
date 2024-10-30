import type { Context } from "hono";

import { type Endpoint, EndpointMethod } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";

import type { GatewayService } from "../gateway-service.ts";

export function gatewayRequestHandler(gatewayServices: GatewayService[], handler: Handler) {
  return async (c: Context) => {
    try {
      const method = c.req.method;
      const url = c.req.url;
      handler.getLog().info(`Received ${method} request for ${url}`);

      const urlObject: URL = new URL(url);
      const endpointUrl: string = urlObject.pathname;

      let selectedGatewayService: GatewayService | undefined = undefined;
      let selectedEndpoint: Endpoint | undefined = undefined;
      for (const gatewayService of gatewayServices) {
        const endpoint: Endpoint | undefined = gatewayService.getEndpoints().find(
          (endpoint) => endpoint.getFullUrl() === endpointUrl && endpoint.getMethod() === method,
        );
        if (endpoint === undefined) continue;
        selectedGatewayService = gatewayService;
        selectedEndpoint = endpoint;
      }
      if (selectedGatewayService === undefined || selectedEndpoint === undefined) {
        return RequestHelpers.sendJsonError(c, HttpStatusCode.NotFound, "notFound", "Endpoint not found");
      }

      const headers = new Headers(c.req.raw.headers); // Crea una copia delle intestazioni originali

      const body: Record<string, unknown> = await c.req.parseBody();

      // Filtra solo i campi stringa, ignorando eventuali File
      const formData = Object.fromEntries(
        Object.entries(body).filter(([_, value]) => typeof value === "string"),
      );

      // Ora puoi usare `URLSearchParams` senza errori
      const data = headers.get("Content-Type") === "application/x-www-form-urlencoded"
        ? new URLSearchParams(formData as Record<string, string>).toString()
        : JSON.stringify(body);

      // Configura i parametri di query
      const params = new URLSearchParams(c.req.query()).toString();

      // Costruisce l'URL di destinazione del servizio
      const requestToServiceUrl = new URL(selectedGatewayService.getServiceRoot() + selectedEndpoint.getUrl());

      requestToServiceUrl.search = params;

      // Effettua la richiesta verso il servizio con fetch
      const fetchOptions: RequestInit = {
        method: selectedEndpoint.getMethod(),
        headers,
        body: [EndpointMethod.POST, EndpointMethod.PUT].includes(selectedEndpoint.getMethod()) ? data : undefined,
      };

      const response = await fetch(requestToServiceUrl.toString(), fetchOptions);

      // Inoltra la risposta al client
      const responseBody = await response.json();
      return RequestHelpers.sendJsonResponse(c, responseBody);
    } catch (error) {
      if (error instanceof Response && error.status) {
        // Se l'errore proviene dal sottoservizio, inoltra la risposta esatta
        return RequestHelpers.sendJsonError(c, error.status, "error", await error.json());
      } else {
        console.error(error);
        // In caso di altri errori, come problemi di rete, restituisci un 500
        return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
      }
    }
  };
}
