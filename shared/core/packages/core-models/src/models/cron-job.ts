// third party
import { Column, Entity } from "typeorm";
import { Expose } from "class-transformer";

// local
import { EntityModel } from "./entity-model.ts";

@Entity()
export class CronJob extends EntityModel {
  @Column({ type: "varchar", length: 255 })
  @Expose({ groups: ["read", "create", "update", "fromJson", "toJson"] })
  name!: string;

  @Column({ type: "text", nullable: true })
  @Expose({ groups: ["read", "create", "update", "fromJson", "toJson"] })
  description?: string;

  @Column({ type: "varchar", length: 255 })
  @Expose({ groups: ["read", "create", "update", "fromJson", "toJson"] })
  schedule!: string;

  @Column({ type: "varchar", length: 255 })
  @Expose({ groups: ["read", "create", "update", "fromJson", "toJson"] })
  command!: string;

  @Column({ type: "text", nullable: true })
  @Expose({ groups: ["read", "create", "update", "fromJson", "toJson"] })
  parameters?: string;

  @Column({ type: "timestamp", nullable: true })
  @Expose({ groups: ["read", "fromJson", "toJson"] })
  lastRun?: Date;

  @Column({ type: "timestamp", nullable: true })
  @Expose({ groups: ["read", "fromJson", "toJson"] })
  nextRun?: Date;

  @Column({ type: "varchar", length: 255 })
  @Expose({ groups: ["read", "create", "update", "fromJson", "toJson"] })
  status!: string;

  @Column({ type: "varchar", length: 255 })
  @Expose({ groups: ["read", "create", "update", "fromJson", "toJson"] })
  lastStatus?: string;

  @Column({ type: "text", nullable: true })
  @Expose({ groups: ["read", "create", "update", "fromJson", "toJson"] })
  lastResult?: string;

  @Column({ type: "boolean", default: true })
  @Expose({ groups: ["read", "update", "fromJson", "toJson"] })
  isActive!: boolean;

  constructor(name: string = "", schedule: string = "", command: string = "") {
    super();
    this.name = name;
    this.schedule = schedule;
    this.command = command;

    this.isActive = true;
    this.status = "idle";
  }
}
