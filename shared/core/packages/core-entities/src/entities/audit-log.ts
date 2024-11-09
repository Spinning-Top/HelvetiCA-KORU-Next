// third party
import { Expose, Transform } from "class-transformer";

// local
import type { AuditAction } from "../support/index.ts";
import { LinkedUser } from "./linked-user.ts";
import { RootEntity } from "./root-entity.ts";
import type { User } from "./user.ts";

export class AuditLog extends RootEntity {
  @Expose({ groups: ["database", "json", "read", "create"] })
  entityName!: string;

  @Expose({ groups: ["database", "json", "read", "create"] })
  entityId!: number;

  @Expose({ groups: ["database", "json", "read", "create"] })
  value: Record<string, unknown> | undefined;

  @Expose({ groups: ["database", "json", "read", "create"] })
  @Transform(({ value }) => new LinkedUser(value), { toPlainOnly: true })
  user?: User;

  @Expose({ groups: ["database", "json", "read", "create"] })
  action!: AuditAction;
}
