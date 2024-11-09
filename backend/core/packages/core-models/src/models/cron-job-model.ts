// third party
import { Column, Entity } from "typeorm";
import { Expose } from "class-transformer";

// project
import { CronJobStatus } from "@koru/core-entities";

// local
import { BaseModel } from "./base-model.ts";

@Entity()
export class CronJobModel extends BaseModel {
  @Column({ type: "varchar", length: 255 })
  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  name!: string;

  @Column({ type: "text", nullable: true })
  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  description?: string;

  @Column({ type: "varchar", length: 255 })
  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  schedule!: string;

  @Column({ type: "varchar", length: 255 })
  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  command!: string;

  @Column({ type: "text", nullable: true })
  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  parameters?: string;

  @Column({ type: "timestamp", nullable: true })
  @Expose({ groups: ["database", "json", "read", "internalUpdate"] })
  lastRun?: Date;

  @Column({ type: "timestamp", nullable: true })
  @Expose({ groups: ["database", "json", "read", "internalUpdate"] })
  nextRun?: Date;

  @Column({ type: "enum", enum: CronJobStatus, default: CronJobStatus.Idle })
  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  status!: CronJobStatus;

  @Column({ type: "varchar", length: 255, nullable: true })
  @Expose({ groups: ["database", "json", "read", "internalUpdate"] })
  lastStatus?: string;

  @Column({ type: "text", nullable: true })
  @Expose({ groups: ["database", "json", "read", "internalUpdate"] })
  lastResult?: string;

  @Column({ type: "boolean", default: true })
  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  isActive!: boolean;
}
