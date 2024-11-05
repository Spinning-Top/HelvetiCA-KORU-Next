// third party
import "es6-shim";
import "reflect-metadata";

// local
import { Dummy } from "./models/index.ts";

export * from "./models/index.ts";

export const featureModels: unknown[] = [Dummy];
