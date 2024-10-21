import { Expose, Transform } from "class-transformer";
import { AfterInsert, AfterSoftRemove, AfterUpdate, JoinColumn, ManyToOne } from "typeorm";

import { AuditAction } from "./audit-action.ts";
import { AuditLog } from "./audit-log.ts";
import { BaseModel } from "./base-model.ts";
import { LinkedUser } from "./linked-user.ts";
import { User } from "./user.ts";
import type { User as UserType } from "./user.ts";

export class EntityModel extends BaseModel {
  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: "createdBy" })
  @Expose({ groups: ["read", "fromJson", "toJson"] })
  @Transform(({ value }) => (value ? new LinkedUser(value) : null), { toPlainOnly: true })
  createdBy?: UserType;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: "deletedBy" })
  @Expose({ groups: ["read", "fromJson", "toJson"] })
  @Transform(({ value }) => (value ? new LinkedUser(value) : null), { toPlainOnly: true })
  deletedBy?: UserType;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: "updatedBy" })
  @Expose({ groups: ["read", "fromJson", "toJson"] })
  @Transform(({ value }) => (value ? new LinkedUser(value) : null), { toPlainOnly: true })
  updatedBy?: UserType;

  public constructor() {
    super();
    this.createdBy = undefined;
    this.deletedBy = undefined;
    this.updatedBy = undefined;
  }

  @AfterInsert()
  private async logInsert() {
    await this.createAuditLog(AuditAction.Create, this.toJson());
  }

  @AfterUpdate()
  private async logUpdate() {
    await this.createAuditLog(AuditAction.Update, this.toJson());
  }

  @AfterSoftRemove()
  private async logRemove() {
    await this.createAuditLog(AuditAction.Delete, this.toJson());
  }

  protected createAuditLog(action: AuditAction, value: Record<string, unknown> | undefined): Promise<void> {
    const auditLog = new AuditLog();
    auditLog.entityName = this.constructor.name;
    auditLog.entityId = this.id;
    auditLog.value = value;
    auditLog.action = action;
    if (action === AuditAction.Delete) {
      auditLog.user = this.deletedBy;
    } else if (action === AuditAction.Update) {
      auditLog.user = this.updatedBy;
    } else {
      auditLog.user = this.createdBy;
    }

    return Promise.resolve();
    // TODO save with rabbit
    // const dataSource: DataSource = DatabaseConnection.getDataSource();
    // await dataSource.getRepository(AuditLog).save(auditLog);
  }
}
