// third party
import { type BaseHandler, ConsoleHandler, debug, error, FileHandler, info, type LogRecord, setup, warn } from "@std/log";
import { resolve } from "@std/path";
import { format } from "@std/datetime";

export class Log {
  public constructor(serviceName: string = "") {
    const logPath: string = Deno.env.get("LOG_PATH") || resolve(Deno.cwd(), "./logs");
    const logNamePrefix: string = serviceName.toLowerCase().replace(/ /g, "-");

    const writePermission: Deno.PermissionStatus = Deno.permissions.querySync({ name: "write" });

    try {
      const handlers: Record<string, BaseHandler> = {
        console: new ConsoleHandler("DEBUG", {
          formatter: (logRecord: LogRecord) => {
            const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss.SSS");
            const serviceNameRender: string = serviceName != "" ? `[${serviceName.toUpperCase().replace(/ /g, "-")}]` : "";
            return `${timestamp} ${serviceNameRender}[${logRecord.levelName.toUpperCase()}]: ${logRecord.msg}`;
          },
        }),
      };

      if (writePermission.state === "granted") {
        handlers["fileError"] = new FileHandler("WARN", {
          filename: resolve(logPath, `./${logNamePrefix}-error.log`),
          formatter: (logRecord: LogRecord) => {
            const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss.SSS");
            const serviceNameRender: string = serviceName != "" ? `[${serviceName.toUpperCase().replace(/ /g, "-")}]` : "";
            return `${timestamp} ${serviceNameRender}[${logRecord.levelName.toUpperCase()}]: ${logRecord.msg}`;
          },
        });
        handlers["fileCombined"] = new FileHandler("DEBUG", {
          filename: resolve(logPath, `./${logNamePrefix}-debug.log`),
          formatter: (logRecord: LogRecord) => {
            const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss.SSS");
            const serviceNameRender: string = serviceName != "" ? `[${serviceName.toUpperCase().replace(/ /g, "-")}]` : "";
            return `${timestamp} ${serviceNameRender}[${logRecord.levelName.toUpperCase()}]: ${logRecord.msg}`;
          },
        });
      }

      setup({
        handlers: handlers,
        loggers: {
          default: {
            level: "DEBUG",
            handlers: writePermission.state === "granted" ? ["console", "fileError", "fileCombined"] : ["console"],
          },
        },
      });

      if (writePermission.state !== "granted") {
        warn("Write permission is NOT granted, logging to file won't be available");
      }
    } catch (_error: unknown) {
      this.error("Failed to setup logger, logging won't be available");
    }
  }

  public debug(message: string): void {
    debug(message);
  }

  public error(message: string): void {
    error(message);
  }

  public info(message: string): void {
    info(message);
  }

  public warn(message: string): void {
    warn(message);
  }
}
