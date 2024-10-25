import { CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { Expose, instanceToPlain, plainToClassFromExist } from "class-transformer";
import type { Request } from "express";
import { validate, type ValidationError } from "class-validator";

export class BaseModel {
  @PrimaryGeneratedColumn()
  @Expose({ groups: ["read", "fromJson", "toJson"] })
  id!: number;

  @CreateDateColumn({ type: "timestamp" })
  @Expose({ groups: ["read", "fromJson", "toJson"] })
  createdAt!: Date;

  @DeleteDateColumn({ type: "timestamp", nullable: true })
  @Expose({ groups: ["read", "fromJson", "toJson"] })
  deletedAt?: Date;

  @UpdateDateColumn({ type: "timestamp", nullable: true })
  @Expose({ groups: ["read", "fromJson", "toJson"] })
  updatedAt?: Date;

  public constructor() {
    this.id = 0;
    this.createdAt = new Date();
    this.deletedAt = undefined;
    this.updatedAt = undefined;
  }

  public async validate(): Promise<ValidationError[]> {
    return await validate(this);
  }

  public static createFromRequest<T>(request: Request, emptyObject: T): T {
    return plainToClassFromExist(emptyObject, request.body, { excludeExtraneousValues: true, groups: ["create"] });
  }

  public updateFromRequest(request: Request): BaseModel {
    return plainToClassFromExist(this, request.body, { excludeExtraneousValues: true, groups: ["update"] });
  }

  public static createFromJsonData<T>(jsonData: Record<string, unknown>, emptyObject: T): T {
    return plainToClassFromExist(emptyObject, jsonData, { excludeExtraneousValues: true, groups: ["fromJson"] });
  }

  public updateFromJsonData(jsonData: Record<string, unknown>): BaseModel {
    return plainToClassFromExist(this, jsonData, { excludeExtraneousValues: true, groups: ["update"] });
  }

  public toReadResponse(): Record<string, unknown> {
    return instanceToPlain(this, { groups: ["read"] });
  }

  public toJson(): Record<string, unknown> {
    return instanceToPlain(this, { groups: ["toJson"] });
  }
}
