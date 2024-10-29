import type { Handler as HonoHandler } from "hono/types";

export class Endpoint {
  private url: string;
  private method: EndpointMethod;
  private authRequired: boolean;
  private allowedPermissions: string[];
  private handler: HonoHandler | undefined;

  public constructor(url: string, method: EndpointMethod, authRequired: boolean = false, allowedPermissions: string[] = []) {
    this.url = url;
    this.method = method;
    this.authRequired = authRequired;
    this.allowedPermissions = allowedPermissions;
    this.handler = undefined;
  }

  public getUrl(): string {
    return this.url;
  }

  public getMethod(): EndpointMethod {
    return this.method;
  }

  public isAuthRequired(): boolean {
    return this.authRequired;
  }

  public getAllowedPermissions(): string[] {
    return this.allowedPermissions;
  }

  public getHandler(): HonoHandler | undefined {
    return this.handler;
  }

  public setHandler(handler: HonoHandler): void {
    this.handler = handler;
  }
}

export enum EndpointMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}
