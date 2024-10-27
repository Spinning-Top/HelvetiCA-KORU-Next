import { type FindManyOptions, type FindOptionsRelations, type FindOptionsWhere, ILike, IsNull, Not, type Repository } from "typeorm";
import type { ValidationError } from "class-validator";

import { type BaseModel, EntityModel, type User } from "@koru/core-models";
import type { Handler } from "@koru/handler";

export class BaseController<T extends BaseModel> {
  protected entityClass: { new (): T };
  protected handler: Handler;
  protected relations: string[];
  protected repository: Repository<T>;
  protected searchFields: string[];

  public constructor(handler: Handler, entityClass: { new (): T }) {
    this.entityClass = entityClass;
    this.handler = handler;
    this.repository = handler.getDatabase().getDataSource().getRepository(entityClass);

    this.relations = [];
    this.searchFields = [];
  }

  public async createEntity(entity: T, user?: User): Promise<T | ValidationError[] | string> {
    // validate the new entity
    const errors: ValidationError[] = await entity.validate();
    // check if there are any validation errors
    if (errors.length > 0) return errors;
    // create the new entity
    entity = this.repository.create(entity);
    // if user is provided, set the createdBy field
    if (user !== undefined && entity instanceof EntityModel) {
      entity.createdBy = user;
    }
    // save the entity
    return this.repository.save(entity);
  }

  public async deleteEntity(entity: T, user?: User): Promise<void> {
    // if user is provided, set the deletedBy field
    if (user !== undefined && entity instanceof EntityModel) {
      entity.deletedBy = user;
      await this.repository.save(entity);
    }
    // soft remove the entity
    await this.repository.softRemove(entity);
  }

  public async getAllEntities(): Promise<T[]> {
    const entities: T[] = await this.repository.find();
    return entities;
  }

  public async getDeletedEntities(): Promise<T[]> {
    const entities: T[] = await this.repository.find({
      withDeleted: true,
      where: { deletedAt: Not(IsNull()) } as FindOptionsWhere<T> | FindOptionsWhere<T>[] | undefined,
    });
    return entities;
  }

  public async getEntitiesWithParams(
    page: number = 1,
    limit: number = 10,
    search: string | undefined = undefined,
  ): Promise<{ entities: Record<string, unknown>[]; total: number; page: number; limit: number }> {
    if (page != undefined) {
      page = Number(page);
      if (page < 1) page = 1;
    }
    if (limit != undefined) {
      limit = Number(limit);
      if (limit < 1) limit = 10;
    }
    if (search != undefined) {
      search = String(search).trim().toLowerCase();
      if (search.length < 3) search = undefined;
    }

    const options: FindManyOptions<T> = {
      skip: (page - 1) * limit,
      take: limit,
    };
    if (search != undefined && this.searchFields.length > 0) {
      options.where = this.searchFields.map((field) => ({
        [field]: ILike(`%${search}%`),
      })) as FindOptionsWhere<T>[];
    }

    const relationsObject: Record<string, boolean> = {};
    for (const relation of this.relations) {
      relationsObject[relation] = true;
    }
    options.relations = relationsObject as FindOptionsRelations<T>;

    const [entities, total] = await this.repository.findAndCount(options);

    return {
      entities: entities.map((entity: T) => entity.toReadResponse()),
      total,
      page,
      limit,
    };
  }

  public async getEntityByField(field: string, value: string): Promise<T | undefined> {
    const entity: T | null = await this.handler.getDatabase().findOneEntityByField(this.entityClass, field, value, this.relations);
    if (entity === null) return undefined;
    return entity;
  }

  public async getEntityById(id: number): Promise<T | undefined> {
    const entity: T | null = await this.handler.getDatabase().findOneEntityById(this.entityClass, id, this.relations);
    if (entity === null) return undefined;
    return entity;
  }

  public async updateEntity(entity: T, user?: User): Promise<T | ValidationError[] | string> {
    // validate the entity
    const errors: ValidationError[] = await entity.validate();
    // check if there are any validation errors
    if (errors.length > 0) return errors;
    // if user is provided, set the updatedBy field
    if (user !== undefined && entity instanceof EntityModel) {
      entity.updatedBy = user;
    }
    // save the new entity and return
    return this.repository.save(entity);
  }
}
