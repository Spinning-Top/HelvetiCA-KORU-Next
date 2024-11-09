// third party
import { JoinColumn, ManyToOne } from "typeorm"; // AfterInsert, AfterSoftRemove, AfterUpdate,
import { Expose } from "class-transformer";

// project
// import { AuditAction } from "@koru/core-entities";
// import { AuditLogHelpers } from "@koru/audit-log-helpers";

// local
import { RootModel } from "./root-model.ts";
import { UserModel } from "./user-model.ts";

export abstract class BaseModel extends RootModel {
  @ManyToOne(() => UserModel, { nullable: true, eager: true })
  @JoinColumn({ name: "createdBy" })
  @Expose({ groups: ["database", "json", "read", "create"] })
  createdBy?: UserModel;

  @ManyToOne(() => UserModel, { nullable: true, eager: true })
  @JoinColumn({ name: "deletedBy" })
  @Expose({ groups: ["database", "json", "read", "update"] })
  deletedBy?: UserModel;

  @ManyToOne(() => UserModel, { nullable: true, eager: true })
  @JoinColumn({ name: "updatedBy" })
  @Expose({ groups: ["database", "json", "read", "update"] })
  updatedBy?: UserModel;

  /* TODO
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
  */
}
