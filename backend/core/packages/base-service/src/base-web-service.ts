// third party
import { type Context, Hono, type MiddlewareHandler } from "hono";
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
import { AuthHelpers } from "@koru/auth-helpers";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";

// local
import { BaseService } from "./base-service.ts";
import type { Endpoint } from "./endpoint.ts";
import { EndpointMethod } from "./endpoint-method.ts";

export abstract class BaseWebService extends BaseService {
  protected endpoints: Endpoint[];
  protected hono: Hono<{ Variables: JwtVariables }>;
  protected port: number = 0;

  public constructor(name: string) {
    super(name);
    this.endpoints = [];
    this.hono = new Hono<{ Variables: JwtVariables }>();
  }

  protected override async start(): Promise<void> {
    await super.start();

    // get the port from the config
    this.getPortFromConfig();

    // register endpoints
    this.registerEndpoints();

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
  }

  // deno-lint-ignore require-await
  protected override async boot(): Promise<void> {
    // initialize the web server
    const server: Deno.HttpServer = Deno.serve(
      {
        onListen: () => this.handler.getLog().info(`${this.name} is running on port ${this.port}`),
        port: this.port,
        signal: this.abortController.signal,
      },
      this.hono.fetch,
    );

    // wait for the server to finish
    server.finished.then(() => this.handler.getLog().info(`${this.name} has been stopped`));
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

  private registerEndpoints(): void {
    for (const endpoint of this.endpoints) {
      // if the endpoint has no handler, skip it
      if (endpoint.getHandler() === undefined) continue;
      // get the auth middlewares from the helper
      const authMiddlewares: MiddlewareHandler[] = AuthHelpers.getAuthMiddlewares(this.handler);
      // decide which middlewares to use, based on whether the endpoint requires auth or not
      const middlewares: MiddlewareHandler[] = endpoint.isAuthRequired() ? [...authMiddlewares, endpoint.getHandler()!] : [endpoint.getHandler()!];
      // log the registration
      this.handler.getLog().info(`Registering ${EndpointMethod[endpoint.getMethod()]} ${endpoint.getUrl()}`);
      // register the endpoint
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
        case EndpointMethod.ALL:
          this.hono.all(endpoint.getUrl(), ...middlewares);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${endpoint.getMethod()}`);
      }
    }
  }

  public setEndpoints(endpoints: Endpoint[]): void {
    this.endpoints = endpoints;
  }
}
