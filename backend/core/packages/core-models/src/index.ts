// local
import { AuditLogModel, CronJobModel, EmailModel, NotificationModel, RefreshTokenModel, RoleModel, UserModel } from "./models/index.ts";

export * from "./models/index.ts";

export const coreModels: unknown[] = [AuditLogModel, CronJobModel, EmailModel, NotificationModel, RefreshTokenModel, RoleModel, UserModel];
