import { Expose, Transform } from "class-transformer";
import { AfterInsert, AfterSoftRemove, AfterUpdate, JoinColumn, ManyToOne } from "typeorm";

import { AuditLogHelpers } from "@koru/audit-log-helpers";

import { AuditAction } from "./audit-action.ts";
import { BaseModel } from "./base-model.ts";
import { LinkedUser } from "./linked-user.ts";
import { User } from "./user.ts";

export class EntityModel extends BaseModel {
  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: "createdBy" })
  @Expose({ groups: ["read", "fromJson", "toJson"] })
  @Transform(({ value }) => (value ? new LinkedUser(value) : null), { toPlainOnly: true })
  createdBy?: User;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: "deletedBy" })
  @Expose({ groups: ["read", "fromJson", "toJson"] })
  @Transform(({ value }) => (value ? new LinkedUser(value) : null), { toPlainOnly: true })
  deletedBy?: User;

  @ManyToOne(() => User, { nullable: true, eager: true })
  @JoinColumn({ name: "updatedBy" })
  @Expose({ groups: ["read", "fromJson", "toJson"] })
  @Transform(({ value }) => (value ? new LinkedUser(value) : null), { toPlainOnly: true })
  updatedBy?: User;

  public constructor() {
    super();
    this.createdBy = undefined;
    this.deletedBy = undefined;
    this.updatedBy = undefined;
  }

  @AfterInsert()
  private async logInsert() {
    await AuditLogHelpers.createAuditLog(this.constructor.name, this.id, this.createdBy, AuditAction.Create, this.toJson());
  }

  @AfterUpdate()
  private async logUpdate() {
    await AuditLogHelpers.createAuditLog(this.constructor.name, this.id, this.updatedBy, AuditAction.Update, this.toJson());
  }

  @AfterSoftRemove()
  private async logRemove() {
    await AuditLogHelpers.createAuditLog(this.constructor.name, this.id, this.deletedBy, AuditAction.Delete, this.toJson());
  }
}
