import express from "express";

import { AuthHelpers } from "@koru/auth-helpers";
import { type Endpoint, EndpointMethod } from "./endpoint.ts";
import { errorHandler, notFoundHandler } from "./middlewares/index.ts";
import { Handler } from "./handler.ts";
import type { Rabbit } from "./rabbit.ts";

export class Microservice {
  private baseUrl: string;
  private endpoints: Endpoint[];
  private handler: Handler;
  private name: string;
  private port: number;
  private rabbits: Rabbit[];
  private serviceRoot: string;

  public constructor(name: string, baseUrl: string = "") {
    this.name = name;
    this.baseUrl = baseUrl;
    this.port = 0;
    this.endpoints = [];
    this.rabbits = [];

    this.handler = new Handler();

    // if this is not a test
    if (this.handler.getGlobalConfig().environment === "development") {
      // set service root as localhost
      this.serviceRoot = "http://localhost";
    } else {
      // set service root as the docker container name
      this.serviceRoot = `http://${this.name.toLowerCase().replace(" ", "-")}`;
    }
  }

  public async start(): Promise<void> {
    try {
      // express setup
      this.handler.getExpress().use(express.json());
      this.handler.getExpress().use(express.urlencoded({ extended: false }));

      // register endpoints
      this.registerEndpoints();

      // register not found handler
      this.handler.getExpress().use(notFoundHandler);
      // register error handler
      this.handler.getExpress().use(errorHandler);

      // initialize rabbit breeder
      await this.handler.getRabbitBreeder().initialize();

      // register rabbits
      await this.registerRabbits();

      // connect to database
      await this.handler.getDatabase().connect();

      // if this is not a test
      if (this.handler.getGlobalConfig().environment !== "test") {
        // send endpoints to the gateway and get the service port
        await this.sendEndpointsToGatewayAndGetPort();
      }

      // boot server
      this.bootServer();
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

  private registerEndpoints(): void {
    for (const endpoint of this.endpoints) {
      if (endpoint.getHandler() === undefined) continue;

      const middlewares = endpoint.isAuthRequired() && this.handler.getGlobalConfig().environment !== "test"
        ? [AuthHelpers.getUserMiddleware(endpoint.getAllowedPermissions()), endpoint.getHandler()!]
        : [endpoint.getHandler()!];

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

  private bootServer(): void {
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
          if (key === "x") {
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
  }

  public getHandler(): Handler {
    return this.handler;
  }

  public setEndpoints(endpoints: Endpoint[]): void {
    this.endpoints = endpoints;
  }

  public setRabbits(rabbits: Rabbit[]): void {
    this.rabbits = rabbits;
  }
}
