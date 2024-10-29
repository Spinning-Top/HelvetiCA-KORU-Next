import type { MiddlewareHandler } from "hono";

// import { AuthHelpers } from "@koru/auth-helpers";
import { EndpointMethod } from "@koru/base-service";

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

    this.serviceRoot = `http://localhost:${this.port}`;
  }

  public override async start(): Promise<void> {
    try {
      await super.start();

      // register endpoints
      this.registerEndpoints();

      // register rabbits
      await this.registerRabbits();

      // send service data to the gateway
      await this.sendServiceDataToGateway();

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

  private async sendServiceDataToGateway(): Promise<void> {
    this.handler.getLog().info("Sending service data to the gateway...");
    const endpointsData: Record<string, unknown>[] = [];
    for (const endpoint of this.endpoints) {
      endpointsData.push({
        url: endpoint.getUrl(),
        fullUrl: endpoint.getFullUrl(),
        method: endpoint.getMethod(),
        authRequired: endpoint.isAuthRequired(),
        allowedPermissions: endpoint.getAllowedPermissions(),
      });
    }

    const data: Record<string, unknown> = {
      baseUrl: this.baseUrl,
      endpoints: endpointsData,
      name: this.name,
      serviceRoot: this.serviceRoot,
    };

    try {
      await this.handler.getRabbitBreeder().sendRequest("apiGatewayServiceDataRequest", data);
    } catch (error: unknown) {
      const message: string = (error as Error).message;
      if (message === "timeout") {
        this.handler.getLog().error("Failed to send service data to the gateway: request timeout");
      } else {
        this.handler.getLog().error("Failed to send service data to the gateway: unknown error");
      }
      // stop services
      await this.stop();
      // quit
      Deno.exit(0);
    }
  }

  private registerEndpoints(): void {
    for (const endpoint of this.endpoints) {
      if (endpoint.getHandler() === undefined) continue;

      /* TODO
      const middlewares: MiddlewareHandler[] = endpoint.isAuthRequired() 
        ? [AuthHelpers.getAuthMiddleware(this.handler), endpoint.getHandler()!] 
        : [endpoint.getHandler()!];
      */
      const middlewares: MiddlewareHandler[] = [endpoint.getHandler()!];

      this.handler.getLog().info(`Registering ${EndpointMethod[endpoint.getMethod()]} ${endpoint.getUrl()}`);

      switch (endpoint.getMethod()) {
        case EndpointMethod.GET:
          this.hono.get(endpoint.getUrl(), ...middlewares);
          break;
        case EndpointMethod.POST:
          this.hono.post(endpoint.getUrl(), ...middlewares);
          break;
        case EndpointMethod.PUT:
          this.hono.put(endpoint.getUrl(), ...middlewares);
          break;
        case EndpointMethod.DELETE:
          this.hono.delete(endpoint.getUrl(), ...middlewares);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${endpoint.getMethod()}`);
      }
    }
  }

  public setRabbits(rabbits: Rabbit[]): void {
    this.rabbits = rabbits;
  }
}
