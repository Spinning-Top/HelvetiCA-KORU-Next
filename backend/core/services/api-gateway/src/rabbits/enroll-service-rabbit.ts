// third party
import type { ConsumeMessage } from "amqplib";

// project
import { createEndpoint } from "../utils/index.ts";
import type { Endpoint } from "@koru/base-service";
import type { Gateway } from "../gateway.ts";
import { GatewayService } from "../gateway-service.ts";
import type { Handler } from "@koru/handler";
import { Rabbit } from "@koru/rabbit-breeder";

export function enrollServiceRabbit(handler: Handler, gateway: Gateway): Rabbit<void> {
  // create a new rabbit instance for the service enrollment
  const rabbit: Rabbit<void> = new Rabbit<void>("enrollServiceRequest");
  // set the response handler for the service enrollment
  // deno-lint-ignore require-await
  rabbit.setResponseHandler(async (msg: ConsumeMessage): Promise<void> => {
    // get the endpoint data json from the message
    const data: Record<string, unknown> = JSON.parse(msg.content.toString());
    if (data === undefined) return;
    if (data.endpoints === undefined) return;
    if (!Array.isArray(data.endpoints)) return;
    if (data.name === undefined) return;
    if (data.baseUrl === undefined) return;
    if (data.serviceRoot === undefined) return;

    const serviceName: string = String(data.name);
    const baseUrl: string = String(data.baseUrl);
    const serviceRoot: string = String(data.serviceRoot);

    // check if the service is already registered
    const gatewayServiceCheck: GatewayService | undefined = gateway.getGatewayServices().find((s) => s.getName() === data.name);
    if (gatewayServiceCheck !== undefined) {
      handler.getLog().info(`Gateway service ${data.name} already registered`);
      return;
    }

    // create a new gateway service
    const gatewayService: GatewayService = new GatewayService(serviceName, baseUrl, serviceRoot);

    // create the endpoints
    let endpointCount: number = 0;
    for (const endpointData of data.endpoints) {
      const endpoint: Endpoint | undefined = createEndpoint(endpointData, gatewayService);
      if (endpoint === undefined) continue;
      // if the endpoint is valid
      gatewayService.addEndpoint(endpoint);
      endpointCount++;
    }

    // add the gateway service to the gateway
    gateway.getGatewayServices().push(gatewayService);
    handler.getLog().info(`${endpointCount} endpoints received from ${gatewayService.getName()}`);
  });
  // return the rabbit instance
  return rabbit;
}
