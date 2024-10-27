import type { ConsumeMessage } from "amqplib";

import { createEndpoint } from "./utils/index.ts";
import { BaseService, type Endpoint } from "@koru/base-service";

export class Gateway extends BaseService {

  public constructor() {
    super("KORU API Gateway", 9100);
  }

  public override async start(): Promise<void> {
    try {
      await super.start();

      // start the rabbit service listeners
      await this.startRabbitServiceListeners();

      this.handler.getLog().info("Waiting for endpoints...");

      if (this.handler.getGlobalConfig().environment === "development") {
        // delay 5 seconds to wait for all endpoints to be received
        await new Promise((resolve) => setTimeout(resolve, 20000));
      } else {
        // delay 10 seconds to wait for all endpoints to be received
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }

      // register endpoints
      this.registerEndpoints();

      // boot server
      this.bootServer();
    } catch (error: unknown) {
      this.handler.getLog().error((error as Error).message);
    }
  }

  private async startRabbitServiceListeners(): Promise<void> {
    // deno-lint-ignore require-await
    const responseHandler = async (msg: ConsumeMessage): Promise<Record<string, unknown> | undefined> => {
      // get the endpoint data json from the message
      const data: Record<string, unknown> = JSON.parse(msg.content.toString());
      if (data === undefined) return undefined;
      if (data.endpoints === undefined) return undefined;
      if (!Array.isArray(data.endpoints)) return undefined;
      if (data.sender === undefined) return undefined;
      if (data.baseUrl === undefined) return undefined;
      if (data.serviceRoot === undefined) return undefined;

      const baseUrl: string = String(data.baseUrl);
      const serviceRoot: string = `${String(data.serviceRoot)}:${String(data.port)}`;

      let endpointCount: number = 0;
      for (const endpointData of data.endpoints) {
        const endpoint: Endpoint | undefined = createEndpoint(endpointData, baseUrl, serviceRoot);
        // if the endpoint is valid and not already registered
        if (
          endpoint !== undefined &&
          this.endpoints.find((e) => e.getUrl() === endpoint.getUrl() && e.getMethod() === endpoint.getMethod()) === undefined
        ) {
          this.endpoints.push(endpoint);
          endpointCount++;
        }
      }

      this.getHandler().getLog().info(`${endpointCount} endpoints received from ${data.sender} for service url ${serviceRoot}`);
    };

    const rabbitTag: string | undefined = await this.handler.getRabbitBreeder().startRequestListener("apiGatewayServiceRequest", responseHandler);
    if (rabbitTag !== undefined) this.handler.getRabbitTags().push(rabbitTag);
  }
}
