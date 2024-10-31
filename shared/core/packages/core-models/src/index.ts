import "es6-shim";
import "reflect-metadata";

export * from "./models/index.ts";

import { AuditAction, AuditLog, CronJob, Email, Notification, RefreshToken, Role, User } from "./models/index.ts";

export const coreModels: unknown[] = [AuditAction, AuditLog, CronJob, Email, Notification, RefreshToken, Role, User];
