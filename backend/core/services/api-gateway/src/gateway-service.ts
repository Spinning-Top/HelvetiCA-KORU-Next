// project
import type { Endpoint } from "@koru/base-service";

export class GatewayService {
  private baseUrl: string;
  private endpoints: Endpoint[] = [];
  private name: string;
  private serviceRoot: string;

  public constructor(name: string, baseUrl: string, serviceRoot: string) {
    this.name = name;
    this.baseUrl = baseUrl;
    this.serviceRoot = serviceRoot;
  }

  public addEndpoint(endpoint: Endpoint): void {
    this.endpoints.push(endpoint);
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public getEndpoints(): Endpoint[] {
    return this.endpoints;
  }

  public getName(): string {
    return this.name;
  }

  public getServiceRoot(): string {
    return this.serviceRoot;
  }

  public setEndpoints(endpoints: Endpoint[]): void {
    this.endpoints = endpoints;
  }
}
