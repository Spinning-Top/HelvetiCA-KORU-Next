// third party
import { Expose, Transform } from "class-transformer";

// local
import { LinkedUser } from "./linked-user.ts";
import { RootEntity } from "./root-entity.ts";
import type { User } from "./user.ts";

export class BaseEntity extends RootEntity {
  @Expose({ groups: ["database", "json", "read", "create"] })
  @Transform(({ value }) => (value ? new LinkedUser(value) : null), { toPlainOnly: true })
  createdBy?: User;

  @Expose({ groups: ["database", "json", "read", "update"] })
  @Transform(({ value }) => (value ? new LinkedUser(value) : null), { toPlainOnly: true })
  deletedBy?: User;

  @Expose({ groups: ["database", "json", "read", "update"] })
  @Transform(({ value }) => (value ? new LinkedUser(value) : null), { toPlainOnly: true })
  updatedBy?: User;
}
