// third party
import { type Context, Hono } from "hono";
import { resolve } from "@std/path";
import type { HTTPResponseError } from "hono/types";
import {
  JwtAlgorithmNotImplemented,
  JwtTokenExpired,
  JwtTokenInvalid,
  JwtTokenIssuedAt,
  JwtTokenNotBefore,
  JwtTokenSignatureMismatched,
} from "hono/utils/jwt/types";
import type { JwtVariables } from "hono/jwt";

// project
import { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";

// local
import type { Endpoint } from "./endpoint.ts";

export class BaseService {
  protected abortController: AbortController;
  protected endpoints: Endpoint[];
  protected handler: Handler;
  protected hono: Hono<{ Variables: JwtVariables }>;
  protected name: string;
  protected port: number = 0;

  public constructor(name: string) {
    this.abortController = new AbortController();
    this.endpoints = [];
    this.handler = new Handler(name);
    this.hono = new Hono<{ Variables: JwtVariables }>();
    this.name = name;
  }

  protected async start(): Promise<void> {
    try {
      // get the port from the config
      this.getPortFromConfig();

      // initialize rabbit breeder
      await this.handler.getRabbitBreeder().initialize(this.name);

      // connect to database
      await this.handler.getDatabase().connect();

      // not found handler
      this.hono.notFound((c: Context) => {
        return RequestHelpers.sendJsonError(c, HttpStatusCode.NotFound, "notFound", "Endpoint not found");
      });

      // error handler
      this.hono.onError((err: Error | HTTPResponseError, c: Context) => {
        // check if the error is an instance of a JWT error
        if (
          err instanceof JwtAlgorithmNotImplemented ||
          err instanceof JwtTokenInvalid ||
          err instanceof JwtTokenNotBefore ||
          err instanceof JwtTokenExpired ||
          err instanceof JwtTokenIssuedAt ||
          err instanceof JwtTokenSignatureMismatched
        ) {
          // log the JWT error
          this.handler.getLog().warn(`JWT Error: ${err.message}`);
          return RequestHelpers.sendJsonError(c, HttpStatusCode.Unauthorized, "unauthorized", err.message);
        }
        // otherwise log a generic error
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
          signal: this.abortController.signal,
        },
        this.hono.fetch,
      );

      server.finished.then(() => this.handler.getLog().info(`${this.name} has been stopped`));

      // Ascolta il segnale SIGTERM
      Deno.addSignalListener("SIGTERM", () => {
        console.log("SIGTERM received: shutting down gracefully...");
        this.stop();
      });

      // Ascolta il segnale SIGINT (CTRL+C) se vuoi supportarlo
      Deno.addSignalListener("SIGINT", () => {
        console.log("SIGINT received: shutting down gracefully...");
        this.stop();
      });
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

  private getPortFromConfig(): void {
    // set the port to zero
    this.port = 0;
    // get the env path
    const envPath: string = Deno.env.get("ENV_PATH") || Deno.cwd();
    // set the sections
    const sections: string[] = ["core", "feature"];
    // for each section
    for (const section of sections) {
      // set the config path
      const configPath: string = resolve(envPath, `./config/${section}/services.json`);
      // get the services
      const services: { name: string; path: string; devPort: string; prodPort: string; enabled: boolean }[] = JSON.parse(
        Deno.readTextFileSync(configPath),
      );
      // for each service
      for (const service of services) {
        // if the service name is the same as the current service
        if (service.name === this.name) {
          // set the port
          this.port = this.handler.isProd() ? parseInt(service.prodPort) : parseInt(service.devPort);
          // return
          return;
        }
      }
    }
    // if the port is still zero
    if (this.port === 0) throw new Error(`Port not found for service ${this.name}`);
  }

  public getHandler(): Handler {
    return this.handler;
  }

  public setEndpoints(endpoints: Endpoint[]): void {
    this.endpoints = endpoints;
  }
}
