import { type Context, Hono } from "hono";
import type { JwtVariables } from "hono/jwt";

import type { Endpoint } from "./endpoint.ts";
import { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import type { HTTPResponseError } from "hono/types";

export class BaseService {
  protected abortController: AbortController;
  protected endpoints: Endpoint[];
  protected handler: Handler;
  protected hono: Hono<{ Variables: JwtVariables }>;
  protected name: string;
  protected port: number;

  public constructor(name: string, port: number = 0) {
    this.abortController = new AbortController();
    this.endpoints = [];
    this.handler = new Handler();
    this.hono = new Hono<{ Variables: JwtVariables }>();
    this.name = name;
    this.port = port;
  }

  protected async start(): Promise<void> {
    try {
      // initialize rabbit breeder
      await this.handler.getRabbitBreeder().initialize();

      // connect to database
      await this.handler.getDatabase().connect();

      // hono endpoint setup
      /* TODO non dovrebbe servire?
      this.hono.use("*", async (c: Context, next) => {
        const method = c.req.method;
        const url = c.req.url;
        this.handler.getLog().info(`Received ${method} request for ${url}`);
      
        const endpoint: Endpoint | undefined = this.endpoints.find((e) => e.getUrl() === url && e.getMethod() === method);
        console.log(endpoint);
      
        await next();
      });
      */

      // not found handler
      this.hono.notFound((c: Context) => {
        return RequestHelpers.sendJsonError(c, HttpStatusCode.NotFound, "notFound", "Endpoint not found");
      });

      // error handler
      this.hono.onError((err: Error | HTTPResponseError, c: Context) => {
        this.handler.getLog().error(`Request error: ${err.message}`);
        return RequestHelpers.sendJsonError(c, HttpStatusCode.InternalServerError, "requestError", err.message);
      });
    } catch (error: unknown) {
      this.handler.getLog().error((error as Error).message);
    }
  }

  protected bootServer(): void {
    try {
      const server: Deno.HttpServer = Deno.serve(
        {
          onListen: () => this.handler.getLog().info(`${this.name} is running on port ${this.port}`),
          port: this.port,
          signal: this.abortController.signal
        },
        this.hono.fetch,
      );
      server.finished.then(() => this.handler.getLog().info(`${this.name} has been stopped`));
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
      this.abortController.abort();
    } catch (error: unknown) {
      this.handler.getLog().error((error as Error).message);
    }
  }

  public getHandler(): Handler {
    return this.handler;
  }

  public setEndpoints(endpoints: Endpoint[]): void {
    this.endpoints = endpoints;
  }
}
