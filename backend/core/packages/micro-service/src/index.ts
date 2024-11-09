// project
import { BaseWebService } from "@koru/base-service";

export class MicroService extends BaseWebService {
  private baseUrl: string;
  private serviceRoot: string;

  public constructor(name: string, baseUrl: string = "") {
    super(name);
    this.baseUrl = baseUrl;
    this.serviceRoot = "";
  }

  public override async start(): Promise<void> {
    try {
      await super.start();

      this.serviceRoot = `http://localhost:${this.port}`;

      // enroll service to the gateway
      await this.enrollServiceToGateway();

      // boot server
      this.boot();
    } catch (error: unknown) {
      this.handler.getLog().error((error as Error).message);
    }
  }

  private async enrollServiceToGateway(): Promise<void> {
    // log the current action
    this.handler.getLog().info("Enrolling service to the gateway...");
    // create endpoint data holder
    const endpointsData: Record<string, unknown>[] = [];
    // loop through the endpoints
    for (const endpoint of this.endpoints) {
      // push the endpoint data
      endpointsData.push({
        url: endpoint.getUrl(),
        fullUrl: endpoint.getFullUrl(),
        method: endpoint.getMethod(),
        authRequired: endpoint.isAuthRequired(),
        allowedPermissions: endpoint.getAllowedPermissions(),
      });
    }

    // create request data
    const data: Record<string, unknown> = {
      baseUrl: this.baseUrl,
      endpoints: endpointsData,
      name: this.name,
      serviceRoot: this.serviceRoot,
    };

    try {
      // send the request to the gateway
      await this.handler.getRabbitBreeder().sendRequest("enrollServiceRequest", data);
    } catch (error: unknown) {
      // get the error message
      const message: string = (error as Error).message;
      // log the error
      if (message === "timeout") {
        this.handler.getLog().error("Failed to enroll service to the gateway: request timeout");
      } else {
        this.handler.getLog().error("Failed to enroll service to the gateway: unknown error");
      }
      // stop services
      await this.stop();
      // quit
      Deno.exit(0);
    }
  }
}
