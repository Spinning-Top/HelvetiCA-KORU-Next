import { type Context, Hono } from "hono";
import type { JwtVariables } from "hono/jwt";

import type { Endpoint } from "./endpoint.ts";
import { Handler } from "@koru/handler";
import { HttpStatusCode, RequestHelpers } from "@koru/request-helpers";
import type { HTTPResponseError } from "hono/types";
import {
  JwtAlgorithmNotImplemented,
  JwtTokenExpired,
  JwtTokenInvalid,
  JwtTokenIssuedAt,
  JwtTokenNotBefore,
  JwtTokenSignatureMismatched,
} from "hono/utils/jwt/types";

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
    this.handler = new Handler(name);
    this.hono = new Hono<{ Variables: JwtVariables }>();
    this.name = name;
    this.port = port;
  }

  protected async start(): Promise<void> {
    try {
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

  public getHandler(): Handler {
    return this.handler;
  }

  public setEndpoints(endpoints: Endpoint[]): void {
    this.endpoints = endpoints;
  }
}
