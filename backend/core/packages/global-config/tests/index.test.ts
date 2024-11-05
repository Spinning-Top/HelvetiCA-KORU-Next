// third party
import { assertExists } from "@std/assert";

// local
import { getGlobalConfig } from "../src/index.ts";

const globalConfig = getGlobalConfig();

Deno.test("GlobalConfig get", () => {
  assertExists(globalConfig, "globalConfig is not set");
  assertExists(globalConfig.auth.jwtSecret, "jwtSecret is not set");
});
