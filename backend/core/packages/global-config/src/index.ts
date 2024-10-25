import { load } from "@std/dotenv";

/*
const env: string = Deno.env.get("ENV") || "development"; 
let envPath: string;

if (env === "production") {
  envPath = resolve(Deno.cwd(), "./.env.prod");
} else {
  envPath = resolve(Deno.cwd(), "./.env.dev");
}
*/

// TODO ENVIRONMENT
const envPath: string | undefined = Deno.env.get("ENV_PATH");
if (envPath == undefined) throw new Error("ENV_PATH is not defined");

console.log(`Loading environment variables from ${envPath}`);

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
    username: string;
  };
  environment: "production" | "development";
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
  if (conf.ENVIRONMENT == undefined) throw new Error("ENVIRONMENT is not defined");
  if (conf.RABBITMQ_HOST == undefined) throw new Error("RABBITMQ_HOST is not defined");
  if (conf.RABBITMQ_PASSWORD == undefined) throw new Error("RABBITMQ_PASSWORD is not defined");
  if (conf.RABBITMQ_REQUEST_TIMEOUT == undefined) throw new Error("RABBITMQ_REQUEST_TIMEOUT is not defined");
  if (conf.RABBITMQ_SERVICE_PORT == undefined) throw new Error("RABBITMQ_SERVICE_PORT is not defined");
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
      username: conf.DB_USERNAME,
    },
    environment: conf.ENVIRONMENT as "production" | "development",
    rabbitMq: {
      host: conf.RABBITMQ_HOST,
      password: conf.RABBITMQ_PASSWORD,
      requestTimeout: parseInt(conf.RABBITMQ_REQUEST_TIMEOUT),
      servicePort: parseInt(conf.RABBITMQ_SERVICE_PORT),
      username: conf.RABBITMQ_USERNAME,
    },
  };
}
