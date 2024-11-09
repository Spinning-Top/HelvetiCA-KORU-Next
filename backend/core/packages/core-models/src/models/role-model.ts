// third party
import { Column, Entity } from "typeorm";
import { Expose } from "class-transformer";

// local
import { BaseModel } from "./base-model.ts";

@Entity()
export class RoleModel extends BaseModel {
  @Column({ type: "varchar", length: 255 })
  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  name!: string;

  @Column({ type: "boolean", default: true })
  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  isActive!: boolean;

  @Column({ type: "json", default: [] })
  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  permissions!: string[];
}
