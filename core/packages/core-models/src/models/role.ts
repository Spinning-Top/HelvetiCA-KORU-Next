import { Column, Entity } from "typeorm";
import { Expose } from "class-transformer";

import { EntityModel } from "./entity-model.ts";

@Entity()
export class Role extends EntityModel {
  @Column({ type: "varchar", length: 255 })
  @Expose({ groups: ["read", "create", "update", "fromJson", "toJson"] })
  name!: string;

  @Column({ type: "boolean", default: true })
  @Expose({ groups: ["read", "update", "fromJson", "toJson"] })
  isActive!: boolean;

  @Column({ type: "json", default: [] })
  @Expose({ groups: ["read", "create", "update", "fromJson", "toJson"] })
  permissions!: string[];

  constructor(name: string = "", permissions: string[] = []) {
    super();
    this.name = name;
    this.permissions = permissions;

    this.isActive = true;
  }

  public hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }
}
