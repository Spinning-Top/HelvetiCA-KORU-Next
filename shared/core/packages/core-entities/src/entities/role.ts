// third party
import { Expose } from "class-transformer";

// local
import { BaseEntity } from "./base-entity.ts";

export class Role extends BaseEntity {
  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  name!: string;

  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  isActive: boolean = true;

  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  permissions!: string[];

  public hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }
}
