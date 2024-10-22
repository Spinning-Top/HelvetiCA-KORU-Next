import "es6-shim";
import "reflect-metadata";

export * from "./models/index.ts";

import { Dummy } from "./models/index.ts";

export const featureModels: unknown[] = [Dummy];
