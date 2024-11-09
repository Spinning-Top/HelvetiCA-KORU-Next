// third party
import { Expose, instanceToPlain, plainToClassFromExist } from "class-transformer";
import { validate, type ValidationError } from "class-validator";

export class RootEntity {
  @Expose({ groups: ["database", "json", "read", "create"] })
  id: number = 0;

  @Expose({ groups: ["database", "json", "read", "create"] })
  createdAt: Date = new Date();

  @Expose({ groups: ["database", "json", "read", "update"] })
  deletedAt?: Date;

  @Expose({ groups: ["database", "json", "read", "update"] })
  updatedAt?: Date;

  public async validate(): Promise<ValidationError[]> {
    return await validate(this);
  }

  // convert entity to json object
  public toJson(): Record<string, unknown> {
    return instanceToPlain(this, { groups: ["json"] });
  }

  // create entity from json object
  public static fromJson<T extends RootEntity>(jsonObject: Record<string, unknown>, EntityClass: new () => T): T {
    return plainToClassFromExist(new EntityClass(), jsonObject, { excludeExtraneousValues: true, groups: ["json"] });
  }

  // TODO
  public static createFromRequest<T>(body: Record<string, unknown>, emptyObject: T): T {
    return plainToClassFromExist(emptyObject, body, { excludeExtraneousValues: true, groups: ["create"] });
  }

  // TODO
  public updateFromRequest(body: Record<string, unknown>): RootEntity {
    return plainToClassFromExist(this, body, { excludeExtraneousValues: true, groups: ["update"] });
  }

  // TODO
  public updateFromJsonData(jsonData: Record<string, unknown>): RootEntity {
    return plainToClassFromExist(this, jsonData, { excludeExtraneousValues: true, groups: ["update"] });
  }

  // TODO
  public toReadResponse(): Record<string, unknown> {
    return instanceToPlain(this, { groups: ["read"] });
  }
}
