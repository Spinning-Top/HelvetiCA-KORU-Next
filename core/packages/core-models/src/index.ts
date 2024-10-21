import "es6-shim";
import "reflect-metadata";

export * from "./models/index.ts";

import { AuditLog, Email, Notification, RefreshToken, Role, User } from "./models/index.ts";

export const coreModels: unknown[] = [AuditLog, Email, Notification, RefreshToken, Role, User];
