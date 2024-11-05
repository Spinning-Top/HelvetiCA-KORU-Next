// project
import { Endpoint, type EndpointMethod } from "@koru/base-service";

// local
import type { GatewayService } from "../gateway-service.ts";

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
  endpoint.setFullUrl(gatewayService.getBaseUrl() + endpoint.getUrl());

  return endpoint;
}
