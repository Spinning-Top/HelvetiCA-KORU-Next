import { Database } from "@koru/database";
import { getGlobalConfig, type GlobalConfig } from "@koru/global-config";
import { Log } from "@koru/log";
import { RabbitBreeder } from "@koru/rabbit-breeder";

export class Handler {
  private database: Database;
  private globalConfig: GlobalConfig;
  private log: Log;
  private rabbitBreeder: RabbitBreeder;
  private rabbitTags: string[];

  public constructor() {
    this.globalConfig = getGlobalConfig();
    this.log = new Log();
    this.database = new Database(this.globalConfig);
    this.rabbitBreeder = new RabbitBreeder(this.globalConfig);
    this.rabbitTags = [];
  }

  public getDatabase(): Database {
    return this.database;
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
}
