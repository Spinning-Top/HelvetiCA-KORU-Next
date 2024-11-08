// third party
import type { DataSource } from "typeorm";

// project
import { type AuditAction, AuditLog, type User } from "@koru/core-models";

export class AuditLogHelpers {
  private static dataSource: DataSource | undefined = undefined;

  public static initialize(dataSource: DataSource): void {
    this.dataSource = dataSource;
  }

  private static getDataSource(): DataSource {
    if (!this.dataSource) throw new Error("DataSource non è stato inizializzato in AuditLogHelpers.");
    return this.dataSource;
  }

  public static async createAuditLog(
    entityName: string,
    entityId: number,
    user: User | undefined,
    action: AuditAction,
    value: Record<string, unknown> | undefined,
  ): Promise<void> {
    const auditLog = new AuditLog();
    auditLog.entityName = entityName;
    auditLog.entityId = entityId;
    auditLog.value = value;
    auditLog.action = action;
    auditLog.user = user;

    await this.getDataSource().getRepository(AuditLog).save(auditLog);
  }
}
