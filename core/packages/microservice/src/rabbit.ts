import type { ConsumeMessage } from "amqplib";

export class Rabbit<T = unknown> {
  private requestQueue: string;
  private responseHandler: ((msg: ConsumeMessage) => Promise<T>) | undefined;

  public constructor(requestQueue: string) {
    this.requestQueue = requestQueue;
  }

  public getRequestQueue(): string {
    return this.requestQueue;
  }

  public getResponseHandler(): ((msg: ConsumeMessage) => Promise<T>) | undefined {
    return this.responseHandler;
  }

  public setResponseHandler(responseHandler: (msg: ConsumeMessage) => Promise<T>): void {
    this.responseHandler = responseHandler;
  }
}
