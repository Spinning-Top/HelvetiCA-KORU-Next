// third party
import type { Repository } from "typeorm";

// project
import type { BaseModel } from "@koru/core-models";
import type { Handler } from "@koru/handler";

export class DatabaseHelpers {
  public static async getEntityByField<T extends BaseModel>(
    handler: Handler,
    EntityModelClass: { new (): T },
    field: string,
    value: string,
    relations?: string[],
  ): Promise<T | undefined> {
    const entity: T | null = await handler.getDatabase().findOneEntityByField(EntityModelClass, field, value, relations ?? []);
    return entity === null ? undefined : entity;
  }

  public static async getEntityById<T extends BaseModel>(
    handler: Handler,
    EntityModelClass: { new (): T },
    id: number,
    relations?: string[],
  ): Promise<T | undefined> {
    const entity: T | null = await handler.getDatabase().findOneEntityById(EntityModelClass, id, relations ?? []);
    if (entity === null) return undefined;
    return entity;
  }

  public static async updateEntity<T extends BaseModel>(handler: Handler, EntityModelClass: { new (): T }, entity: T): Promise<T> {
    // get the entity repository
    const entityRepository: Repository<T> = handler.getDatabase().getDataSource().getRepository(EntityModelClass);
    // save the entity
    return await entityRepository.save(entity);
  }
}
