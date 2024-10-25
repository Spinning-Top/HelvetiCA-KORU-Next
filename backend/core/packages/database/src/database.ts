import {
  DataSource,
  type EntityTarget,
  type FindOneOptions,
  type FindOptionsRelations,
  type MixedList,
  type ObjectLiteral,
  type Repository,
} from "typeorm";

import { coreModels } from "@koru/core-models";
import { featureModels } from "@koru/feature-models";
import type { GlobalConfig } from "@koru/global-config";
import { DatabaseConnection } from "./database-connection.ts";

export class Database {
  private dataSource: DataSource;
  private globalConfig: GlobalConfig;

  public constructor(globalConfig: GlobalConfig) {
    this.globalConfig = globalConfig;

    this.dataSource = new DataSource({
      database: this.globalConfig.database.name,
      host: this.globalConfig.database.host,
      password: this.globalConfig.database.password,
      port: this.globalConfig.database.port,
      username: this.globalConfig.database.username,
      entities: [...coreModels, ...featureModels] as MixedList<string>,
      synchronize: true,
      type: "postgres",
    });
  }

  public async connect(): Promise<DataSource> {
    this.dataSource = await this.dataSource.initialize();
    DatabaseConnection.setDataSource(this.dataSource);
    return this.dataSource;
  }

  public async disconnect(): Promise<void> {
    return await this.dataSource.destroy();
  }

  public async findOneEntityById<T extends ObjectLiteral>(entity: EntityTarget<T>, id: number, relations: string[] = []): Promise<T | null> {
    if (this.dataSource.isInitialized === false) throw new Error("Database not connected");

    const repository: Repository<T> = this.dataSource.getRepository(entity);

    const findOneOptions: FindOneOptions = { where: { id } };

    const relationsObject: Record<string, boolean> = {};
    for (const relation of relations) {
      relationsObject[relation] = true;
    }
    findOneOptions.relations = relationsObject as FindOptionsRelations<T>;

    const one: T | null = await repository.findOne(findOneOptions);
    return one;
  }

  public async findOneEntityByField<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    field: string,
    value: unknown,
    relations: string[] = [],
  ): Promise<T | null> {
    if (this.dataSource.isInitialized === false) throw new Error("Database not connected");

    const repository: Repository<T> = this.dataSource.getRepository(entity);

    const findOneOptions: FindOneOptions = { where: { [field]: value } };

    const relationsObject: Record<string, boolean> = {};
    for (const relation of relations) {
      relationsObject[relation] = true;
    }
    findOneOptions.relations = relationsObject as FindOptionsRelations<T>;

    const one: T | null = await repository.findOne(findOneOptions);
    return one;
  }

  public getDataSource(): DataSource {
    return this.dataSource;
  }
}
