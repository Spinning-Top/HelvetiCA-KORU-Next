// third party
import { resolve } from "@std/path";
import { loadSync } from "@std/dotenv";

// project
import type { Locale, Theme } from "@koru/core-models";

let conf: Record<string, string> = {};

export function initGlobalConfig(): void {
  const envPath: string = Deno.env.get("ENV_PATH") || Deno.cwd();
  // TODO
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
    defaultLocale: Locale;
    defaultTheme: Theme;
    version: string;
  };
  mail: {
    domain: string;
    host: string;
    maxFailures: number;
    port: number;
    privateKey: string;
    selector: string;
    sendInterval: number;
    senderAddress: string;
    senderName: string;
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
  if (conf.KORU_DEFAULT_LOCALE == undefined) throw new Error("KORU_DEFAULT_LOCALE is not defined");
  if (conf.KORU_DEFAULT_THEME == undefined) throw new Error("KORU_DEFAULT_THEME is not defined");
  if (conf.KORU_VERSION == undefined) throw new Error("KORU_VERSION is not defined");
  if (conf.MAIL_DOMAIN == undefined) throw new Error("MAIL_DOMAIN is not defined");
  if (conf.MAIL_HOST == undefined) throw new Error("MAIL_HOST is not defined");
  if (conf.MAIL_MAX_FAILURES == undefined) throw new Error("MAIL_MAX_FAILURES is not defined");
  if (conf.MAIL_PORT == undefined) throw new Error("MAIL_PORT is not defined");
  if (conf.MAIL_PRIVATE_KEY == undefined) throw new Error("MAIL_PRIVATE_KEY is not defined");
  if (conf.MAIL_SELECTOR == undefined) throw new Error("MAIL_SELECTOR is not defined");
  if (conf.MAIL_SEND_INTERVAL == undefined) throw new Error("MAIL_SEND_INTERVAL is not defined");
  if (conf.MAIL_SENDER_ADDRESS == undefined) throw new Error("MAIL_SENDER_ADDRESS is not defined");
  if (conf.MAIL_SENDER_NAME == undefined) throw new Error("MAIL_SENDER_NAME is not defined");
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
      defaultLocale: conf.KORU_DEFAULT_LOCALE as Locale,
      defaultTheme: conf.KORU_DEFAULT_THEME as Theme,
      version: conf.KORU_VERSION,
    },
    mail: {
      domain: conf.MAIL_DOMAIN,
      host: conf.MAIL_HOST,
      maxFailures: parseInt(conf.MAIL_MAX_FAILURES),
      port: parseInt(conf.MAIL_PORT),
      privateKey: conf.MAIL_PRIVATE_KEY,
      selector: conf.MAIL_SELECTOR,
      sendInterval: parseInt(conf.MAIL_SEND_INTERVAL),
      senderAddress: conf.MAIL_SENDER_ADDRESS,
      senderName: conf.MAIL_SENDER_NAME,
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
