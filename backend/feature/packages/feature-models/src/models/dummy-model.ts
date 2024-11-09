// third party
import { Column, Entity } from "typeorm";
import { Expose } from "class-transformer";

// project
import { BaseModel } from "@koru/core-models";

@Entity()
export class DummyModel extends BaseModel {
  @Column({ type: "varchar", length: 255 })
  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  name!: string;
}
