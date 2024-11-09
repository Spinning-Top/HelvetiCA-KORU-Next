// third party
import {
  DataSource,
  type EntityTarget,
  type FindManyOptions,
  type FindOneOptions,
  type FindOptionsRelations,
  type FindOptionsWhere,
  ILike,
  IsNull,
  type MixedList,
  Not,
  type ObjectLiteral,
  type Repository,
  type UpdateResult,
} from "typeorm";

// project
import { BaseService } from "@koru/base-service";
import { coreModels, type RootModel } from "@koru/core-models";
import { featureModels } from "@koru/feature-models";
import { ReadWithParamsResult } from "@koru/core-entities";

export class DatabaseService extends BaseService {
  private dataSource: DataSource;

  public constructor() {
    super("Database Service");

    this.dataSource = new DataSource({
      database: this.handler.getGlobalConfig().database.name,
      host: this.handler.getGlobalConfig().database.host,
      password: this.handler.getGlobalConfig().database.password,
      port: this.handler.getGlobalConfig().database.port,
      username: this.handler.getGlobalConfig().database.username,
      entities: [...coreModels, ...featureModels] as MixedList<string>,
      synchronize: true,
      type: "postgres",
    });
  }

  public async connect(): Promise<DataSource> {
    this.dataSource = await this.dataSource.initialize();
    return this.dataSource;
  }

  public async disconnect(): Promise<void> {
    return await this.dataSource.destroy();
  }

  public override async stop(): Promise<void> {
    try {
      await this.disconnect();

      await super.stop();
    } catch (error: unknown) {
      this.handler.getLog().error((error as Error).message);
    }
  }

  public async createEntity<T extends ObjectLiteral>(ModelClass: EntityTarget<T>, entity: T): Promise<T | undefined> {
    try {
      if (this.dataSource.isInitialized === false) throw new Error("Database not connected");

      const repository: Repository<T> = this.dataSource.getRepository(ModelClass);
      return await repository.save(entity);
    } catch (error: unknown) {
      this.handler.getLog().error((error as Error).message);
      return undefined;
    }
  }

  public async readEntityById<T extends ObjectLiteral>(ModelClass: EntityTarget<T>, id: number, relations: string[] = []): Promise<T | undefined> {
    try {
      if (this.dataSource.isInitialized === false) throw new Error("Database not connected");

      const repository: Repository<T> = this.dataSource.getRepository(ModelClass);

      const findOneOptions: FindOneOptions = {
        where: { id },
        relations: this.createRelations(relations),
      };

      const one: T | undefined = (await repository.findOne(findOneOptions)) ?? undefined;
      return one;
    } catch (error: unknown) {
      this.handler.getLog().error((error as Error).message);
      return undefined;
    }
  }

  public async readEntityByField<T extends RootModel>(
    ModelClass: EntityTarget<T>,
    field: string,
    value: unknown,
    relations: string[] = [],
  ): Promise<T | undefined> {
    try {
      if (this.dataSource.isInitialized === false) throw new Error("Database not connected");

      const repository: Repository<T> = this.dataSource.getRepository(ModelClass);

      const findOneOptions: FindOneOptions = {
        where: { [field]: value },
        relations: this.createRelations(relations),
      };

      const one: T | undefined = (await repository.findOne(findOneOptions)) ?? undefined;
      return one;
    } catch (error: unknown) {
      this.handler.getLog().error((error as Error).message);
      return undefined;
    }
  }

  public async readAllEntities<T extends ObjectLiteral>(ModelClass: EntityTarget<T>, relations: string[] = []): Promise<T[]> {
    try {
      if (this.dataSource.isInitialized === false) throw new Error("Database not connected");

      const repository: Repository<T> = this.dataSource.getRepository(ModelClass);

      const findManyOptions: FindManyOptions = { relations: this.createRelations(relations) };

      const entities: T[] = await repository.find(findManyOptions);
      return entities;
    } catch (error: unknown) {
      this.handler.getLog().error((error as Error).message);
      return [];
    }
  }

  public async readDeletedEntities<T extends ObjectLiteral>(ModelClass: EntityTarget<T>, relations: string[] = []): Promise<T[]> {
    try {
      if (this.dataSource.isInitialized === false) throw new Error("Database not connected");

      const repository: Repository<T> = this.dataSource.getRepository(ModelClass);

      const findManyOptions: FindManyOptions = {
        withDeleted: true,
        where: { deletedAt: Not(IsNull()) },
        relations: this.createRelations(relations),
      };

      const entities: T[] = await repository.find(findManyOptions);
      return entities;
    } catch (error: unknown) {
      this.handler.getLog().error((error as Error).message);
      return [];
    }
  }

  public async readEntitiesWithParams<T extends ObjectLiteral>(
    ModelClass: EntityTarget<T>,
    page: number = 1,
    limit: number = 10,
    search: string | undefined = undefined,
    searchFields: string[] = [],
    relations: string[] = [],
  ): Promise<ReadWithParamsResult> {
    try {
      if (this.dataSource.isInitialized === false) throw new Error("Database not connected");

      const readWithParamsResult: ReadWithParamsResult = new ReadWithParamsResult(page, limit, search);

      const repository: Repository<T> = this.dataSource.getRepository(ModelClass);

      const findManyOptions: FindManyOptions<T> = {
        skip: readWithParamsResult.getSkip(),
        take: readWithParamsResult.getLimit(),
        relations: this.createRelations(relations),
        where: readWithParamsResult.getSearch() !== undefined
          ? searchFields.map((field) => ({ [field]: ILike(`%${readWithParamsResult.getSearch()}%`) })) as FindOptionsWhere<T>[]
          : undefined,
      };

      const [entities, total] = await repository.findAndCount(findManyOptions);

      readWithParamsResult.setEntities(entities);
      readWithParamsResult.setTotal(total);

      return readWithParamsResult;
    } catch (error: unknown) {
      this.handler.getLog().error((error as Error).message);
      return new ReadWithParamsResult(0, 0);
    }
  }

  public async updateEntity<T extends ObjectLiteral>(ModelClass: EntityTarget<T>, id: number, updatedData: Partial<T>): Promise<boolean> {
    try {
      if (this.dataSource.isInitialized === false) throw new Error("Database not connected");

      const repository: Repository<T> = this.dataSource.getRepository(ModelClass);
      const updateResult: UpdateResult = await repository.update(id, updatedData);
      return updateResult.affected !== undefined && updateResult.affected > 0;
    } catch (error: unknown) {
      this.handler.getLog().error((error as Error).message);
      return false;
    }
  }

  public async softDeleteEntity<T extends ObjectLiteral>(ModelClass: EntityTarget<T>, id: number): Promise<boolean> {
    try {
      if (this.dataSource.isInitialized === false) throw new Error("Database not connected");

      const repository: Repository<T> = this.dataSource.getRepository(ModelClass);
      const result = await repository.softDelete(id);
      return result.affected !== undefined && result.affected != null && result.affected > 0;
    } catch (error: unknown) {
      this.handler.getLog().error((error as Error).message);
      return false;
    }
  }

  public async deleteEntity<T extends ObjectLiteral>(ModelClass: EntityTarget<T>, id: number): Promise<boolean> {
    try {
      if (this.dataSource.isInitialized === false) throw new Error("Database not connected");

      const repository: Repository<T> = this.dataSource.getRepository(ModelClass);
      const result = await repository.delete(id);
      return result.affected !== undefined && result.affected != null && result.affected > 0;
    } catch (error: unknown) {
      this.handler.getLog().error((error as Error).message);
      return false;
    }
  }

  private createRelations<T extends ObjectLiteral>(relations: string[]): FindOptionsRelations<T> {
    const relationsObject: Record<string, unknown> = {};
    for (const relation of relations) {
      if (relation.includes(".")) {
        const [first, ...rest] = relation.split(".");
        if (relationsObject[first] === undefined) {
          relationsObject[first] = {};
        }
        if (rest.length > 0) {
          (relationsObject[first] as Record<string, boolean>)[rest.join(".")] = true;
        }
      } else {
        relationsObject[relation] = true;
      }
    }
    return relationsObject as FindOptionsRelations<T>;
  }

  public getDataSource(): DataSource {
    return this.dataSource;
  }
}
