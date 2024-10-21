import type { DataSource } from "typeorm";

export class DatabaseConnection {
  private static instance: DataSource;

  private constructor() {}

  public static setDataSource(dataSource: DataSource): void {
    DatabaseConnection.instance = dataSource;
  }

  public static getDataSource(): DataSource {
    if (!DatabaseConnection.instance) {
      throw new Error("DataSource is not initialized. Call setDataSource first.");
    }
    return DatabaseConnection.instance;
  }
}
