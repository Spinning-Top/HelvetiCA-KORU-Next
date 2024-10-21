import express from "express";

import { AuthHelpers } from "@koru/auth-helpers";
import { createEndpoint } from "./utils/index.ts";
import { type Endpoint, EndpointMethod, Handler } from "@koru/microservice";

export class Gateway {
  private endpoints: Endpoint[];
  private handler: Handler;
  private name: string;
  private nextServicePort: number;
  private port: number;

  public constructor() {
    this.endpoints = [];
    this.handler = new Handler();
    this.name = "KORU API Gateway";
    this.nextServicePort = 9201;
    this.port = 9100;
  }

  public async start(): Promise<void> {
    try {
      // express setup
      this.handler.getExpress().use(express.json());
      this.handler.getExpress().use(express.urlencoded({ extended: false }));

      this.handler.getExpress().use((req: Request, _res: Response, next: () => void) => {
        this.handler.getLog().info(`Received ${req.method} request for ${req.url}`);
        const endpoint: Endpoint | undefined = this.endpoints.find((e) => e.getUrl() === req.url && e.getMethod() === req.method);
        console.log(endpoint);
        next();
      });

      // initialize rabbit breeder
      await this.handler.getRabbitBreeder().initialize();

      // start the rabbit service listeners
      await this.startRabbitServiceListeners();

      // connect to database
      await this.handler.getDatabase().connect();

      // init passport
      AuthHelpers.initPassport(
        this.getHandler().getGlobalConfig().auth.jwtSecret,
        this.getHandler().getExpress(),
        this.getHandler().getRabbitBreeder(),
      );

      this.handler.getLog().info("Waiting for endpoints...");

      if (this.handler.getGlobalConfig().environment === "development") {
        // delay 5 seconds to wait for all endpoints to be received
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } else {
        // delay 10 seconds to wait for all endpoints to be received
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }

      // register endpoints
      this.registerEndpoints();

      // start server
      const serverCallback: () => void = async () => {
        this.handler.getLog().info(`${this.name} is running on port ${this.port}`);
  
        // if the process is running in a terminal capable of receiving keystrokes
        if (Deno.stdin.isTerminal()) {
          // enable raw mode to capture keystrokes
          Deno.stdin.setRaw(true);
          // listen for keystrokes
            for await (const chunk of Deno.stdin.readable) {
            const key = new TextDecoder().decode(chunk);
            // if the user presses 'x'
            if (key === 'x') {
              this.handler.getLog().info(`${this.name} is stopping...`);
              // stop services
              await this.stop();
              // quit
              Deno.exit(0);
            }
          }
        }
      };
      this.handler.setServer(this.handler.getExpress().listen(this.port, serverCallback));
    } catch (error: unknown) {
      this.handler.getLog().error((error as Error).message);
    }
  }

  public async stop(): Promise<void> {
    try {
      // stop rabbits listeners
      for (const rabbitTag of this.handler.getRabbitTags()) {
        await this.handler.getRabbitBreeder().stopRequestListener(rabbitTag);
      }
      // stop rabbit
      await this.handler.getRabbitBreeder().destroy();
      // disconnect from database
      await this.handler.getDatabase().disconnect();
      // stop server
      this.handler.getServer()?.close();
      this.handler.getLog().info(`${this.name} has been stopped`);
    } catch (error: unknown) {
      this.handler.getLog().error((error as Error).message);
    }
  }

  private async startRabbitServiceListeners(): Promise<void> {
    const responseHandler = (response: Record<string, unknown>): Promise<Record<string, unknown> | undefined> => {
      return new Promise((resolve) => {
        const port: number = this.nextServicePort++;
        // get the endpoint data json from the message
        const data: Record<string, unknown> = response;
        if (data === undefined) return undefined;
        if (data.endpoints === undefined) return undefined;
        if (!Array.isArray(data.endpoints)) return undefined;
        if (data.sender === undefined) return undefined;
        if (data.baseUrl === undefined) return undefined;
        if (data.serviceRoot === undefined) return undefined;

        const baseUrl: string = String(data.baseUrl);
        const serviceRoot: string = `${String(data.serviceRoot)}:${port}`;

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
        resolve({ port });
      });
    };

    const rabbitTag: string | undefined = await this.handler.getRabbitBreeder().startRequestListener("apiGatewayServiceRequest", responseHandler);
    if (rabbitTag !== undefined) this.handler.getRabbitTags().push(rabbitTag);
  }

  private registerEndpoints(): void {
    for (const endpoint of this.endpoints) {
      if (endpoint.getHandler() === undefined) continue;

      const middlewares = endpoint.isAuthRequired() ? [AuthHelpers.getAuthMiddleware(), endpoint.getHandler()!] : [endpoint.getHandler()!];

      this.handler.getLog().info(`Registering ${EndpointMethod[endpoint.getMethod()]} ${endpoint.getUrl()}`);

      switch (endpoint.getMethod()) {
        case EndpointMethod.GET:
          this.handler.getExpress().get(endpoint.getUrl(), ...middlewares);
          break;
        case EndpointMethod.POST:
          this.handler.getExpress().post(endpoint.getUrl(), ...middlewares);
          break;
        case EndpointMethod.PUT:
          this.handler.getExpress().put(endpoint.getUrl(), ...middlewares);
          break;
        case EndpointMethod.DELETE:
          this.handler.getExpress().delete(endpoint.getUrl(), ...middlewares);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${endpoint.getMethod()}`);
      }
    }
  }

  public getHandler(): Handler {
    return this.handler;
  }
}
