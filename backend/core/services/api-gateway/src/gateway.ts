// project
import { BaseWebService } from "@koru/base-service";

// local
import type { GatewayService } from "./gateway-service.ts";

export class Gateway extends BaseWebService {
  private gatewayServices: GatewayService[];

  public constructor() {
    super("API Gateway");
    this.gatewayServices = [];
  }

  public override async start(): Promise<void> {
    try {
      await super.start();

      this.boot();
    } catch (error: unknown) {
      this.handler.getLog().error((error as Error).message);
    }
  }

  public getGatewayServices(): GatewayService[] {
    return this.gatewayServices;
  }
}
