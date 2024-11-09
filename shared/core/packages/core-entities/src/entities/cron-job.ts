// third party
import { Expose } from "class-transformer";

// project
import { CronJobStatus } from "@koru/core-entities";

// local
import { BaseEntity } from "./base-entity.ts";

export class CronJob extends BaseEntity {
  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  name!: string;

  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  description?: string;

  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  schedule!: string;

  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  command!: string;

  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  parameters?: string;

  @Expose({ groups: ["database", "json", "read", "internalUpdate"] })
  lastRun?: Date;

  @Expose({ groups: ["database", "json", "read", "internalUpdate"] })
  nextRun?: Date;

  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  status: CronJobStatus = CronJobStatus.Idle;

  @Expose({ groups: ["database", "json", "read", "internalUpdate"] })
  lastStatus?: string;

  @Expose({ groups: ["database", "json", "read", "internalUpdate"] })
  lastResult?: string;

  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  isActive: boolean = true;
}
