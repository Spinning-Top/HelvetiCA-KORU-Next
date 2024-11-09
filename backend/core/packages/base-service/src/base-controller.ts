// third party
import type { ValidationError } from "class-validator";

// project
import { BaseEntity, type User } from "@koru/core-entities";
import type { Handler } from "@koru/handler";
import { ReadWithParamsResult } from "@koru/core-entities";

export class BaseController<T extends BaseEntity> {
  protected EntityClass: { new (): T };
  protected handler: Handler;
  protected relations: string[];
  protected searchFields: string[];

  public constructor(handler: Handler, EntityClass: { new (): T }) {
    this.EntityClass = EntityClass;
    this.handler = handler;

    this.relations = [];
    this.searchFields = [];
  }

  public async createEntity(entity: T, user?: User): Promise<T | ValidationError[] | string> {
    // validate the new entity
    const errors: ValidationError[] = await entity.validate();
    // check if there are any validation errors
    if (errors.length > 0) return errors;
    // set the createdBy field
    entity.createdBy = user !== undefined && entity instanceof BaseEntity ? user : undefined;
    // TODO create with rabbit to database
    return "";
  }

  public async deleteEntity(entity: T, user?: User): Promise<boolean> {
    // set the deletedBy field
    entity.deletedBy = user !== undefined && entity instanceof BaseEntity ? user : undefined;
    // TODO update with rabbit to database
    // TODO soft delete with rabbit to database
    return false;
  }

  public async getAllEntities(): Promise<T[]> {
    // TODO get all entities with rabbit from database
    return [];
  }

  public async getDeletedEntities(): Promise<T[]> {
    // TODO get all deleted entities with rabbit from database
    return [];
  }

  public async getEntitiesWithParams(
    page: number = 1,
    limit: number = 10,
    search: string | undefined = undefined,
  ): Promise<ReadWithParamsResult> {
    // TODO get entities with params with rabbit from database
    return new ReadWithParamsResult(page, limit, search);
  }

  public async getEntityByField(field: string, value: string): Promise<T | undefined> {
    // TODO get entity by field with rabbit from database
    return undefined;
  }

  public async getEntityById(id: number): Promise<T | undefined> {
    // TODO get entity by id with rabbit from database
    return undefined;
  }

  public async updateEntity(entity: T, user?: User): Promise<T | ValidationError[] | string> {
    // validate the entity
    const errors: ValidationError[] = await entity.validate();
    // check if there are any validation errors
    if (errors.length > 0) return errors;
    // set the updatedBy field
    entity.updatedBy = user !== undefined && entity instanceof BaseEntity ? user : undefined;
    // TODO update with rabbit to database
    return "";
  }
}
