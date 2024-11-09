// project
import { getGlobalConfig, type GlobalConfig } from "@koru/global-config";
import { Log } from "@koru/log";
import { RabbitBreeder } from "@koru/rabbit-breeder";

export class Handler {
  private globalConfig: GlobalConfig;
  private log: Log;
  private rabbitBreeder: RabbitBreeder;

  public constructor(serviceName: string = "") {
    this.globalConfig = getGlobalConfig();
    this.log = new Log(serviceName);
    this.rabbitBreeder = new RabbitBreeder(this.globalConfig);
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

  public isDev(): boolean {
    return this.globalConfig.environment === "development";
  }

  public isProd(): boolean {
    return this.globalConfig.environment === "production";
  }
}
