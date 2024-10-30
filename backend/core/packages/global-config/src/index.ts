import { dirname, fromFileUrl, resolve } from "@std/path";
import { loadSync } from "@std/dotenv";

let conf: Record<string, string> = {};

export function initGlobalConfig(): void {
  const envPath: string = Deno.env.get("ENV_PATH") || Deno.cwd() || dirname(fromFileUrl(import.meta.url));
  const envFilePath: string = Deno.env.get("ENV") === "production" ? resolve(envPath, ".env.prod") : resolve(envPath, ".env.dev");

  try {
    conf = loadSync({
      envPath: envFilePath,
      export: true,
    });
  } catch (error) {
    console.error(`Failed to load environment variables from ${envFilePath}:`, error);
    throw error;
  }
}

export interface GlobalConfig {
  auth: {
    jwtAccessTokenDuration: number;
    jwtRecoveryTokenDuration: number;
    jwtRefreshTokenDuration: number;
    jwtSecret: string;
  };
  database: {
    host: string;
    name: string;
    password: string;
    port: number;
    username: string;
  };
  environment: "production" | "development";
  koru: {
    version: string;
  };
  rabbitMq: {
    host: string;
    password: string;
    requestTimeout: number;
    servicePort: number;
    username: string;
  };
}

export function getGlobalConfig(): GlobalConfig {
  if (conf.AUTH_JWT_ACCESS_TOKEN_DURATION == undefined) throw new Error("AUTH_JWT_ACCESS_TOKEN_DURATION is not defined");
  if (conf.AUTH_JWT_RECOVERY_TOKEN_DURATION == undefined) throw new Error("AUTH_JWT_RECOVERY_TOKEN_DURATION is not defined");
  if (conf.AUTH_JWT_REFRESH_TOKEN_DURATION == undefined) throw new Error("AUTH_JWT_REFRESH_TOKEN_DURATION is not defined");
  if (conf.AUTH_JWT_SECRET == undefined) throw new Error("AUTH_JWT_SECRET is not defined");
  if (conf.DB_HOST == undefined) throw new Error("DB_HOST is not defined");
  if (conf.DB_NAME == undefined) throw new Error("DB_NAME is not defined");
  if (conf.DB_PASSWORD == undefined) throw new Error("DB_PASSWORD is not defined");
  if (conf.DB_PORT == undefined) throw new Error("DB_PORT is not defined");
  if (conf.DB_USERNAME == undefined) throw new Error("DB_USERNAME is not defined");
  if (conf.ENV == undefined) throw new Error("ENV is not defined");
  if (conf.KORU_VERSION == undefined) throw new Error("KORU_VERSION is not defined");
  if (conf.RABBITMQ_HOST == undefined) throw new Error("RABBITMQ_HOST is not defined");
  if (conf.RABBITMQ_PASSWORD == undefined) throw new Error("RABBITMQ_PASSWORD is not defined");
  if (conf.RABBITMQ_REQUEST_TIMEOUT == undefined) throw new Error("RABBITMQ_REQUEST_TIMEOUT is not defined");
  if (conf.RABBITMQ_SERVICE_PORT == undefined) throw new Error("RABBITMQ_SERVICE_PORT is not defined");
  if (conf.RABBITMQ_USERNAME == undefined) throw new Error("RABBITMQ_USERNAME is not defined");

  return {
    auth: {
      jwtAccessTokenDuration: Number(conf.AUTH_JWT_ACCESS_TOKEN_DURATION),
      jwtRecoveryTokenDuration: Number(conf.AUTH_JWT_RECOVERY_TOKEN_DURATION),
      jwtRefreshTokenDuration: Number(conf.AUTH_JWT_REFRESH_TOKEN_DURATION),
      jwtSecret: conf.AUTH_JWT_SECRET,
    },
    database: {
      host: conf.DB_HOST,
      name: conf.DB_NAME,
      password: conf.DB_PASSWORD,
      port: parseInt(conf.DB_PORT),
      username: conf.DB_USERNAME,
    },
    environment: conf.ENV as "production" | "development",
    koru: {
      version: conf.KORU_VERSION,
    },
    rabbitMq: {
      host: conf.RABBITMQ_HOST,
      password: conf.RABBITMQ_PASSWORD,
      requestTimeout: parseInt(conf.RABBITMQ_REQUEST_TIMEOUT),
      servicePort: parseInt(conf.RABBITMQ_SERVICE_PORT),
      username: conf.RABBITMQ_USERNAME,
    },
  };
}

initGlobalConfig();
