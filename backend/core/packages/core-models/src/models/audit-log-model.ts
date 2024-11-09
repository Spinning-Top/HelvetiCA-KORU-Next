// third party
import { Column, Entity, ManyToOne } from "typeorm";
import { Expose } from "class-transformer";

// project
import type { AuditAction } from "@koru/core-entities";

// local
import { RootModel } from "./root-model.ts";
import { UserModel } from "./user-model.ts";

@Entity()
export class AuditLogModel extends RootModel {
  @Column({ type: "varchar", length: 255 })
  @Expose({ groups: ["database", "json", "read", "create"] })
  entityName!: string;

  @Column({ type: "int" })
  @Expose({ groups: ["database", "json", "read", "create"] })
  entityId!: number;

  @Column({ type: "json", nullable: true })
  @Expose({ groups: ["database", "json", "read", "create"] })
  value: Record<string, unknown> | undefined;

  @ManyToOne(() => UserModel, { nullable: true, eager: true })
  @Expose({ groups: ["database", "json", "read", "create"] })
  user?: UserModel;

  @Column({ type: "varchar", length: 255 })
  @Expose({ groups: ["database", "json", "read", "create"] })
  action!: AuditAction;
}
