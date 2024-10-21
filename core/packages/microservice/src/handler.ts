import express from "express";
import type { Server } from "node:http";

import { Database } from "@koru/database";
import { getGlobalConfig, type GlobalConfig } from "@koru/global-config";
import { Log } from "./log.ts";
import { RabbitBreeder } from "@koru/rabbit-breeder";

export class Handler {
  private database: Database;
  private express: express.Express;
  private globalConfig: GlobalConfig;
  private log: Log;
  private rabbitBreeder: RabbitBreeder;
  private rabbitTags: string[];
  private server: Server | undefined;

  public constructor() {
    this.globalConfig = getGlobalConfig();
    this.express = express();
    this.log = new Log();
    this.database = new Database(this.globalConfig);
    this.rabbitBreeder = new RabbitBreeder(this.globalConfig);
    this.rabbitTags = [];
    this.server = undefined;
  }

  public getDatabase(): Database {
    return this.database;
  }

  public getExpress(): express.Express {
    return this.express;
  }

  public getGlobalConfig(): GlobalConfig {
    return this.globalConfig;
  }

  public getLog(): Log {
    return this.log;
  }

  public getRabbitBreeder(): RabbitBreeder {
    return this.rabbitBreeder;
  }

  public getRabbitTags(): string[] {
    return this.rabbitTags;
  }

  public getServer(): Server | undefined {
    return this.server;
  }

  public setServer(server: Server): void {
    this.server = server;
  }
}
