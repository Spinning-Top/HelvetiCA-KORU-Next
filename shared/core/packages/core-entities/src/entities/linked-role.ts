// third party
import { Expose } from "class-transformer";

// local
import type { Role } from "./role.ts";

export class LinkedRole {
  @Expose()
  id!: number;

  @Expose()
  name!: string;

  @Expose()
  permissions!: string[];

  public constructor(role: Role) {
    this.id = role.id;
    this.name = role.name;
    this.permissions = role.permissions;
  }

  public hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }
}
