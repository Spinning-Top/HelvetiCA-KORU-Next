// project
import { Handler } from "@koru/handler";
import type { Rabbit } from "@koru/rabbit-breeder";

export abstract class BaseService {
  protected abortController: AbortController;
  protected handler: Handler;
  protected name: string;
  private rabbits: Rabbit[];
  private rabbitTags: string[];

  public constructor(name: string) {
    this.abortController = new AbortController();
    this.handler = new Handler(name);
    this.name = name;
    this.rabbits = [];
    this.rabbitTags = [];
  }

  protected async start(): Promise<void> {
    // initialize rabbit breeder
    await this.handler.getRabbitBreeder().initialize(this.name);

    // register rabbits
    await this.registerRabbits();

    // register the signal listeners
    this.registerSignalListeners();
  }

  protected async boot(): Promise<void> {
    // log that the service is running
    this.handler.getLog().info(`${this.name} is running`),
      // listen for abort signal
      await new Promise((resolve) => this.abortController.signal.addEventListener("abort", resolve));

    // log that the service has been stopped
    this.handler.getLog().info(`${this.name} has been stopped`);
  }

  public async startAndBoot(): Promise<void> {
    try {
      // start the service
      await this.start();

      // boot the service
      await this.boot();
    } catch (error: unknown) {
      this.handler.getLog().error((error as Error).message);
    }
  }

  public async stop(): Promise<void> {
    try {
      // stop rabbits listeners
      for (const rabbitTag of this.getRabbitTags()) {
        await this.handler.getRabbitBreeder().stopRequestListener(rabbitTag);
      }

      // stop rabbit breeder
      await this.handler.getRabbitBreeder().destroy();

      // stop server
      this.abortController.abort();
    } catch (error: unknown) {
      this.handler.getLog().error((error as Error).message);
    }
  }

  private async registerRabbits(): Promise<void> {
    for (const rabbit of this.rabbits) {
      // if the rabbit has no response handler, skip it
      if (rabbit.getResponseHandler() === undefined) continue;

      // start request listener and get the rabbit tag
      const rabbitTag: string | undefined = await this.handler
        .getRabbitBreeder()
        .startRequestListener(rabbit.getRequestQueue(), rabbit.getResponseHandler()!);

      // if the rabbit tag is defined, add it to the handler
      if (rabbitTag !== undefined) this.addRabbitTag(rabbitTag);
    }
  }

  private registerSignalListeners(): void {
    // listen for SIGTERM signal
    Deno.addSignalListener("SIGTERM", () => this.stop());

    // listen for SIGINT signal (CTRL+C)
    Deno.addSignalListener("SIGINT", () => this.stop());
  }

  public getHandler(): Handler {
    return this.handler;
  }

  public setRabbits(rabbits: Rabbit[]): void {
    this.rabbits = rabbits;
  }

  public getRabbitTags(): string[] {
    return this.rabbitTags;
  }

  public addRabbitTag(tag: string): void {
    this.rabbitTags.push(tag);
  }
}
