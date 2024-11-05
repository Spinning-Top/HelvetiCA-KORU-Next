// third party
import "es6-shim";
import "reflect-metadata";

// local
import { AuditAction, AuditLog, CronJob, Email, Notification, RefreshToken, Role, User } from "./models/index.ts";

export * from "./models/index.ts";

export const coreModels: unknown[] = [AuditAction, AuditLog, CronJob, Email, Notification, RefreshToken, Role, User];
