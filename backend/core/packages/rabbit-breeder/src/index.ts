import { Buffer } from "node:buffer";

import { type Channel, connect, type Connection, type ConsumeMessage } from "amqplib";

import { NAMESPACE_DNS, v5 } from "@std/uuid";

import type { GlobalConfig } from "@koru/global-config";

const rabbitBreederHash: Uint8Array = new TextEncoder().encode("koru-rabbit-breeder");

export class RabbitBreeder {
  private channel: Channel | undefined;
  private connection: Connection | undefined;
  private globalConfig: GlobalConfig;

  public constructor(globalConfig: GlobalConfig) {
    this.globalConfig = globalConfig;
  }

  public async initialize(): Promise<void> {
    if (this.connection !== undefined) return;

    try {
      this.connection = await connect({
        hostname: this.globalConfig.rabbitMq.host,
        port: this.globalConfig.rabbitMq.servicePort,
        username: this.globalConfig.rabbitMq.username,
        password: this.globalConfig.rabbitMq.password,
      });
      this.channel = await this.connection.createChannel();
    } catch (error) {
      console.error(error);
      throw new Error("Error during RabbitMQ connection");
    }
  }

  public async destroy() {
    if (this.channel !== undefined) await this.channel.close();
    if (this.connection !== undefined) await this.connection.close();
  }

  public async sendRequest(requestQueue: string, requestParams: Record<string, unknown>): Promise<void> {
    await this.initialize();
    if (this.channel === undefined) return undefined;

    const correlationId: string = await v5.generate(NAMESPACE_DNS, rabbitBreederHash);

    this.channel.sendToQueue(requestQueue, Buffer.from(JSON.stringify(requestParams)), { correlationId });
  }

  public async sendRequestAndAwaitResponse<T>(
    requestQueue: string,
    responseQueue: string,
    requestParams: Record<string, unknown>,
    responseCreator: (data: Record<string, unknown>) => T,
  ): Promise<T | undefined> {
    await this.initialize();
    if (this.channel === undefined) return undefined;

    const correlationId: string = await v5.generate(NAMESPACE_DNS, rabbitBreederHash);

    const randomResponseQueue: string = `${responseQueue}-${await v5.generate(NAMESPACE_DNS, rabbitBreederHash)}`;
    await this.channel.assertQueue(randomResponseQueue, { autoDelete: true, exclusive: true });

    const result: T = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("timeout"));
      }, this.globalConfig.rabbitMq.requestTimeout);

      this.channel!.consume(
        randomResponseQueue,
        (msg: ConsumeMessage | null) => {
          console.log("msg:", msg);
          if (msg === null) return;

          if (msg.properties.correlationId === correlationId) {
            clearTimeout(timeout);

            const response = JSON.parse(msg.content.toString());
            const object: T = responseCreator(response);
            resolve(object);
            this.channel!.ack(msg);
          }
        },
        { noAck: false },
      );

      this.channel!.sendToQueue(requestQueue, Buffer.from(JSON.stringify(requestParams)), {
        correlationId,
        replyTo: randomResponseQueue,
      });
    });

    return result;
  }

  public async startRequestListener<T>(requestQueue: string, responseCreator: (msg: ConsumeMessage) => Promise<T>): Promise<string | undefined> {
    await this.initialize();
    if (this.channel === undefined) return undefined;

    this.channel.assertQueue(requestQueue, { durable: false, exclusive: false });

    const { consumerTag } = await this.channel.consume(requestQueue, async (msg: ConsumeMessage | null) => {
      console.log("listen:", msg);
      if (msg !== null) {
        const objectToSend: T = await responseCreator(msg);
        console.log("objectToSend:", objectToSend);
        if (objectToSend != undefined) {
          this.channel!.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(objectToSend)), {
            correlationId: msg.properties.correlationId,
          });
        }

        this.channel!.ack(msg);
      }
    });

    return consumerTag;
  }

  public async stopRequestListener(consumerTag: string): Promise<void> {
    if (this.channel === undefined) return;
    await this.channel.cancel(consumerTag);
  }
}
