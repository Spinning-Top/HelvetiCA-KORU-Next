import { dirname, fromFileUrl, resolve } from "@std/path";
import { load } from "@std/dotenv";

const currentFilePath = fromFileUrl(import.meta.url);
const currentDirPath = dirname(currentFilePath);
const envPath: string = resolve(currentDirPath, "../../../../.env");

const conf: Record<string, string> = await load({
  envPath: envPath,
  export: true,
});

export interface GlobalConfig {
  auth: {
    jwtAccessTokenDuration: string;
    jwtRecoveryTokenDuration: string;
    jwtRefreshTokenDuration: string;
    jwtSecret: string;
  };
  database: {
    host: string;
    name: string;
    password: string;
    port: number;
    type: string;
    username: string;
  };
  environment: "production" | "development" | "test";
  mail: {
    domain: string;
    host: string;
    intervalSeconds: number;
    maxFailures: number;
    port: number;
    privateKeyPath: string;
    selector: string;
    senderAddress: string;
    senderName: string;
  };
  pgadmin: {
    email: string;
    password: string;
    port: number;
  };
  portainer: {
    port: number;
  };
  rabbitMq: {
    host: string;
    password: string;
    requestTimeout: number;
    servicePort: number;
    uiPort: number;
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
  if (conf.DB_TYPE == undefined) throw new Error("DB_TYPE is not defined");
  if (conf.DB_USERNAME == undefined) throw new Error("DB_USERNAME is not defined");
  if (conf.ENVIRONMENT == undefined) throw new Error("ENVIRONMENT is not defined");
  if (conf.MAIL_DOMAIN == undefined) throw new Error("MAIL_DOMAIN is not defined");
  if (conf.MAIL_HOST == undefined) throw new Error("MAIL_HOST is not defined");
  if (conf.MAIL_INTERVAL_SECONDS == undefined) throw new Error("MAIL_INTERVAL_SECONDS is not defined");
  if (conf.MAIL_MAX_FAILURES == undefined) throw new Error("MAIL_MAX_FAILURES is not defined");
  if (conf.MAIL_PORT == undefined) throw new Error("MAIL_PORT is not defined");
  if (conf.MAIL_PRIVATE_KEY_PATH == undefined) throw new Error("MAIL_PRIVATE_KEY_PATH is not defined");
  if (conf.MAIL_SELECTOR == undefined) throw new Error("MAIL_SELECTOR is not defined");
  if (conf.MAIL_SENDER_ADDRESS == undefined) throw new Error("MAIL_SENDER_ADDRESS is not defined");
  if (conf.MAIL_SENDER_NAME == undefined) throw new Error("MAIL_SENDER_NAME is not defined");
  if (conf.PGADMIN_EMAIL == undefined) throw new Error("PGADMIN_EMAIL is not defined");
  if (conf.PGADMIN_PASSWORD == undefined) throw new Error("PGADMIN_PASSWORD is not defined");
  if (conf.PGADMIN_PORT == undefined) throw new Error("PGADMIN_PORT is not defined");
  if (conf.PORTAINER_PORT == undefined) throw new Error("PORTAINER_PORT is not defined");
  if (conf.RABBITMQ_HOST == undefined) throw new Error("RABBITMQ_HOST is not defined");
  if (conf.RABBITMQ_PASSWORD == undefined) throw new Error("RABBITMQ_PASSWORD is not defined");
  if (conf.RABBITMQ_REQUEST_TIMEOUT == undefined) throw new Error("RABBITMQ_REQUEST_TIMEOUT is not defined");
  if (conf.RABBITMQ_SERVICE_PORT == undefined) throw new Error("RABBITMQ_SERVICE_PORT is not defined");
  if (conf.RABBITMQ_UI_PORT == undefined) throw new Error("RABBITMQ_UI_PORT is not defined");
  if (conf.RABBITMQ_USERNAME == undefined) throw new Error("RABBITMQ_USERNAME is not defined");

  return {
    auth: {
      jwtAccessTokenDuration: conf.AUTH_JWT_ACCESS_TOKEN_DURATION,
      jwtRecoveryTokenDuration: conf.AUTH_JWT_RECOVERY_TOKEN_DURATION,
      jwtRefreshTokenDuration: conf.AUTH_JWT_REFRESH_TOKEN_DURATION,
      jwtSecret: conf.AUTH_JWT_SECRET,
    },
    database: {
      host: conf.DB_HOST,
      name: conf.DB_NAME,
      password: conf.DB_PASSWORD,
      port: parseInt(conf.DB_PORT),
      type: conf.DB_TYPE,
      username: conf.DB_USERNAME,
    },
    environment: conf.ENVIRONMENT as "production" | "development" | "test",
    mail: {
      domain: conf.MAIL_DOMAIN,
      host: conf.MAIL_HOST,
      intervalSeconds: parseInt(conf.MAIL_INTERVAL_SECONDS),
      maxFailures: parseInt(conf.MAIL_MAX_FAILURES),
      port: parseInt(conf.MAIL_PORT),
      privateKeyPath: conf.MAIL_PRIVATE_KEY_PATH,
      selector: conf.MAIL_SELECTOR,
      senderAddress: conf.MAIL_SENDER_ADDRESS,
      senderName: conf.MAIL_SENDER_NAME,
    },
    pgadmin: {
      email: conf.PGADMIN_EMAIL,
      password: conf.PGADMIN_PASSWORD,
      port: parseInt(conf.PGADMIN_PORT),
    },
    portainer: {
      port: parseInt(conf.PORTAINER_PORT),
    },
    rabbitMq: {
      host: conf.RABBITMQ_HOST,
      password: conf.RABBITMQ_PASSWORD,
      requestTimeout: parseInt(conf.RABBITMQ_REQUEST_TIMEOUT),
      servicePort: parseInt(conf.RABBITMQ_SERVICE_PORT),
      uiPort: parseInt(conf.RABBITMQ_UI_PORT),
      username: conf.RABBITMQ_USERNAME,
    },
  };
}
