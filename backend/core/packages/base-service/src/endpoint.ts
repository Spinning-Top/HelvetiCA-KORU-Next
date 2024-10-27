import type { Handler as HonoHandler } from "hono/types";

export class Endpoint {
  private url: string;
  private method: EndpointMethod;
  private authRequired: boolean;
  private allowedPermissions: string[];
  private handler: HonoHandler | undefined;
  // for api gateway
  private baseUrl: string | undefined;
  private serviceUrl: string | undefined;
  private serviceRoot: string | undefined;

  public constructor(url: string, method: EndpointMethod, authRequired: boolean = false, allowedPermissions: string[] = []) {
    this.url = url;
    this.method = method;
    this.authRequired = authRequired;
    this.allowedPermissions = allowedPermissions;
    this.handler = undefined;
    this.baseUrl = undefined;
    this.serviceUrl = undefined;
    this.serviceRoot = undefined;
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

  public getBaseUrl(): string | undefined {
    return this.baseUrl;
  }

  public setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  public getServiceUrl(): string | undefined {
    return this.serviceUrl;
  }

  public setServiceUrl(serviceUrl: string): void {
    this.serviceUrl = serviceUrl;
  }

  public getServiceRoot(): string | undefined {
    return this.serviceRoot;
  }

  public setServiceRoot(serviceRoot: string): void {
    this.serviceRoot = serviceRoot;
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
