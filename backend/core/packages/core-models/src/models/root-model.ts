// third party
import { CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Expose } from "class-transformer";
import { instanceToPlain, plainToClassFromExist } from "class-transformer";

// project
import type { RootEntity } from "@koru/core-entities";

export abstract class RootModel {
  @PrimaryGeneratedColumn()
  @Expose({ groups: ["database", "json", "read", "create"] })
  id!: number;

  @CreateDateColumn({ type: "timestamp" })
  @Expose({ groups: ["database", "json", "read", "create"] })
  createdAt!: Date;

  @DeleteDateColumn({ type: "timestamp", nullable: true })
  @Expose({ groups: ["database", "json", "read", "update"] })
  deletedAt?: Date;

  @UpdateDateColumn({ type: "timestamp", nullable: true })
  @Expose({ groups: ["database", "json", "read", "update"] })
  updatedAt?: Date;

  // convert model to entity
  public toEntity<T extends RootEntity>(EntityClass: new () => T): T {
    // convert model to plain object with all properties
    const plainObject = instanceToPlain(this, { excludeExtraneousValues: true, groups: ["database"] });
    // convert plain object to entity
    return plainToClassFromExist(new EntityClass(), plainObject, { excludeExtraneousValues: true, groups: ["database"] });
  }

  // create model from entity
  public static fromEntity<T extends RootModel>(entity: RootEntity, ModelClass: new () => T): T {
    // convert entity to plain object with all properties
    const plainEntity = instanceToPlain(entity, { excludeExtraneousValues: true, groups: ["database"] });
    // convert plain object to model
    return plainToClassFromExist(new ModelClass(), plainEntity, { excludeExtraneousValues: true, groups: ["database"] });
  }

  // convert model to json object
  public toJson(): Record<string, unknown> {
    return instanceToPlain(this, { groups: ["json"] });
  }

  // create model from json object
  public static fromJson<T extends RootModel>(jsonObject: Record<string, unknown>, ModelClass: new () => T): T {
    return plainToClassFromExist(new ModelClass(), jsonObject, { excludeExtraneousValues: true, groups: ["json"] });
  }
}
