import type { Context } from "hono";

import { Endpoint, EndpointMethod } from "@koru/base-service";
import type { GatewayService } from "../gateway-service.ts";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";

export function createEndpoint(endpointData: Record<string, unknown>, gatewayService: GatewayService): Endpoint | undefined {
  if (endpointData === undefined) return undefined;
  if (endpointData.url === undefined) return undefined;
  if (endpointData.method === undefined) return undefined;
  if (endpointData.authRequired === undefined) return undefined;
  if (endpointData.allowedPermissions === undefined) return undefined;

  const endpoint: Endpoint = new Endpoint(
    endpointData.url as string,
    endpointData.method as EndpointMethod,
    endpointData.authRequired as boolean,
    endpointData.allowedPermissions as string[],
  );

  endpoint.setHandler(async (c: Context) => {
    try {
      // Costruisce le intestazioni con eventuale "X-Koru-User"
      const headers = new Headers(c.req.raw.headers); // Crea una copia delle intestazioni originali
      if (c.get('user')) headers.set('X-Koru-User', JSON.stringify(c.get('user')));

      const body: Record<string, unknown> = await c.req.parseBody();

      // Filtra solo i campi stringa, ignorando eventuali File
      const formData = Object.fromEntries(
        Object.entries(body).filter(([_, value]) => typeof value === 'string')
      );
      
      // Ora puoi usare `URLSearchParams` senza errori
      const data = headers.get('Content-Type') === 'application/x-www-form-urlencoded'
        ? new URLSearchParams(formData as Record<string, string>).toString()
        : JSON.stringify(body);

      // Configura i parametri di query
      const params = new URLSearchParams(c.req.query()).toString();

      // Costruisce l'URL di destinazione del servizio
      const requestToServiceUrl = new URL(endpoint.getUrl());
      // TODO
      // DataHelpers.removeFirstOccurrenceOfString(gatewayService.getServiceRoot()!, endgatewayServicepoint.getBaseUrl()!) + endpoint.getServiceUrl()!
      requestToServiceUrl.search = params;

      // Effettua la richiesta verso il servizio con fetch
      const fetchOptions: RequestInit = {
        method: endpoint.getMethod(),
        headers,
        body: [EndpointMethod.POST, EndpointMethod.PUT].includes(endpoint.getMethod()) ? data : undefined,
      };

      const response = await fetch(requestToServiceUrl.toString(), fetchOptions);

      // Inoltra la risposta al client
      const responseBody = await response.json();
      return RequestHelpers.sendJsonResponse(c, responseBody);
    } catch (error) {
      if (error instanceof Response && error.status) {
        // Se l'errore proviene dal sottoservizio, inoltra la risposta esatta
        return RequestHelpers.sendJsonError(c, error.status, 'error', await error.json());
      } else {
        console.error(error);
        // In caso di altri errori, come problemi di rete, restituisci un 500
        return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "error", (error as Error).message);
      }
    }
  });

  return endpoint;
}
