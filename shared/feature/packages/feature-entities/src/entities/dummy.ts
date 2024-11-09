// third party
import { Expose } from "class-transformer";

// project
import { BaseEntity } from "@koru/core-entities";

export class Dummy extends BaseEntity {
  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  name!: string;
}
