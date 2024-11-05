// third party
import { Column, Entity } from "typeorm";
import { Expose } from "class-transformer";

// project
import { EntityModel } from "@koru/core-models";

@Entity()
export class Dummy extends EntityModel {
  @Column({ type: "varchar", length: 255 })
  @Expose({ groups: ["read", "create", "update", "fromJson", "toJson"] })
  name!: string;

  public constructor(name: string = "") {
    super();
    this.name = name;
  }
}
