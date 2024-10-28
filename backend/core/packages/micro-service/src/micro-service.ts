import { BaseService } from "@koru/base-service";

import type { Rabbit } from "./rabbit.ts";

export class MicroService extends BaseService {
  private baseUrl: string;
  private rabbits: Rabbit[];
  private serviceRoot: string;
  
  public constructor(name: string, port: number, baseUrl: string = "") {
    super(name, port);
    this.baseUrl = baseUrl;
    this.rabbits = [];

    this.serviceRoot = `http://localhost:${this.port}${this.baseUrl}`;
  }

  public override async start(): Promise<void> {
    try {
      await super.start();

      // register endpoints
      this.registerEndpoints();

      // register rabbits
      await this.registerRabbits();

      // send endpoints to the gateway and get the service port
      await this.sendEndpointsToGatewayAndGetPort();

      // boot server
      this.bootServer();
    } catch (error: unknown) {
      this.handler.getLog().error((error as Error).message);
    }
  }

  private async registerRabbits(): Promise<void> {
    for (const rabbit of this.rabbits) {
      if (rabbit.getResponseHandler() === undefined) continue;

      const rabbitTag: string | undefined = await this.handler
        .getRabbitBreeder()
        .startRequestListener(rabbit.getRequestQueue(), rabbit.getResponseHandler()!);
      if (rabbitTag !== undefined) this.handler.getRabbitTags().push(rabbitTag);
    }
  }

  private async sendEndpointsToGatewayAndGetPort(): Promise<void> {
    this.handler.getLog().info("Sending endpoints to the gateway...");
    const endpointsData: Record<string, unknown>[] = [];
    for (const endpoint of this.endpoints) {
      endpointsData.push({
        url: endpoint.getUrl(),
        method: endpoint.getMethod(),
        authRequired: endpoint.isAuthRequired(),
        allowedPermissions: endpoint.getAllowedPermissions(),
      });
    }

    const data: Record<string, unknown> = {
      baseUrl: this.baseUrl,
      endpoints: endpointsData,
      sender: this.name,
      serviceRoot: this.serviceRoot,
    };

    try {
      const port: number | undefined = await this.handler
        .getRabbitBreeder()
        .sendRequestAndAwaitResponse<number>("apiGatewayServiceRequest", "apiGatewayPortResponse", data, (response: Record<string, unknown>) => {
          return Number(response.port);
        });
      if (port === undefined) throw new Error("portUndefined");
      this.port = port;
    } catch (error: unknown) {
      const message: string = (error as Error).message;
      if (message === "portUndefined") {
        this.handler.getLog().error("Failed to get service port from the gateway: value undefined");
      } else if (message === "timeout") {
        this.handler.getLog().error("Failed to get service port from the gateway: request timeout");
      } else {
        this.handler.getLog().error("Failed to get service port from the gateway: unknown error");
      }
      // stop services
      await this.stop();
      // quit
      Deno.exit(0);
    }
  }

  public setRabbits(rabbits: Rabbit[]): void {
    this.rabbits = rabbits;
  }
}
