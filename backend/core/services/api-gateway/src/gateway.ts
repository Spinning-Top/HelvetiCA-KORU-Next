import type { ConsumeMessage } from "amqplib";
import type { Context } from "hono";

import { createEndpoint, gatewayRequestHandler } from "./utils/index.ts";
import { BaseService, type Endpoint } from "@koru/base-service";
import { GatewayService } from "./gateway-service.ts";

export class Gateway extends BaseService {
  private gatewayServices: GatewayService[];

  public constructor() {
    super("API Gateway", 9100);
    this.gatewayServices = [];
  }

  public override async start(): Promise<void> {
    try {
      await super.start();

      // hono root info
      this.hono.get("/", (c: Context) => {
        return c.json({
          name: "KORU API",
          version: this.handler.getGlobalConfig().koru.version,
        });
      });
      // hono endpoint setup
      this.hono.all("*", gatewayRequestHandler(this.gatewayServices, this.handler));

      // start the rabbit service listeners
      await this.startRabbitServiceListeners();

      // boot server
      this.bootServer();
    } catch (error: unknown) {
      this.handler.getLog().error((error as Error).message);
    }
  }

  private async startRabbitServiceListeners(): Promise<void> {
    // deno-lint-ignore require-await
    const responseHandler = async (msg: ConsumeMessage): Promise<void> => {
      // get the endpoint data json from the message
      const data: Record<string, unknown> = JSON.parse(msg.content.toString());
      if (data === undefined) return undefined;
      if (data.endpoints === undefined) return undefined;
      if (!Array.isArray(data.endpoints)) return undefined;
      if (data.name === undefined) return undefined;
      if (data.baseUrl === undefined) return undefined;
      if (data.serviceRoot === undefined) return undefined;

      const serviceName: string = String(data.name);
      const baseUrl: string = String(data.baseUrl);
      const serviceRoot: string = String(data.serviceRoot);

      const gatewayServiceCheck: GatewayService | undefined = this.gatewayServices.find((s) => s.getName() === data.name);
      if (gatewayServiceCheck !== undefined) {
        this.handler.getLog().info(`Gateway service ${data.name} already registered`);
        return;
      }

      const gatewayService: GatewayService = new GatewayService(serviceName, baseUrl, serviceRoot);

      let endpointCount: number = 0;
      for (const endpointData of data.endpoints) {
        const endpoint: Endpoint | undefined = createEndpoint(endpointData, gatewayService);
        if (endpoint === undefined) continue;
        // if the endpoint is valid
        gatewayService.addEndpoint(endpoint);
        endpointCount++;
      }

      this.gatewayServices.push(gatewayService);
      this.getHandler().getLog().info(`${endpointCount} endpoints received from ${gatewayService.getName()}`);
    };

    const rabbitTag: string | undefined = await this.handler
      .getRabbitBreeder()
      .startRequestListener(
        "apiGatewayServiceDataRequest",
        responseHandler,
      );
    if (rabbitTag !== undefined) this.handler.getRabbitTags().push(rabbitTag);
  }
}
