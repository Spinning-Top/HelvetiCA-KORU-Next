import { Column, Entity } from "typeorm";
import { Expose } from "class-transformer";
import { IsEmail } from "class-validator";

import { BaseModel } from "./base-model.ts";

@Entity()
export class Notification extends BaseModel {
  @Column({ type: "varchar", length: 255 })
  @IsEmail()
  @Expose({ groups: ["read", "create", "fromJson", "toJson"] })
  type!: string;

  @Column({ type: "json", default: [] })
  @Expose({ groups: ["read", "create", "fromJson", "toJson"] })
  targetUsers!: string[];

  @Column({ type: "json", default: [] })
  @Expose({ groups: ["read", "create", "update", "fromJson", "toJson"] })
  readBy!: string[];

  @Column({ type: "json", default: [] })
  @Expose({ groups: ["read", "create", "update", "fromJson", "toJson"] })
  dismissedBy!: string[];

  public constructor(type: string = "", targetUsers: string[] = []) {
    super();
    this.type = type;
    this.targetUsers = targetUsers;

    this.readBy = [];
    this.dismissedBy = [];
  }
}
