import { ConsoleHandler, error, FileHandler, info, type LogRecord, setup, warn } from "@std/log";

export class Log {
  public constructor() {
    setup({
      handlers: {
        console: new ConsoleHandler("DEBUG", {
          formatter: (logRecord: LogRecord) => {
            const timestamp = new Date().toISOString();
            return `${timestamp} [${logRecord.levelName.toUpperCase()}]: ${logRecord.msg}`;
          },
        }),
        fileError: new FileHandler("WARN", {
          filename: "./logs/error.log",
          formatter: (logRecord: LogRecord) => {
            const timestamp = new Date().toISOString();
            return `${timestamp} [${logRecord.levelName.toUpperCase()}]: ${logRecord.msg}`;
          },
        }),
        fileCombined: new FileHandler("DEBUG", {
          filename: "./logs/combined.log",
          formatter: (logRecord: LogRecord) => {
            const timestamp = new Date().toISOString();
            return `${timestamp} [${logRecord.levelName.toUpperCase()}]: ${logRecord.msg}`;
          },
        }),
      },
    
      loggers: {
        default: {
          level: "DEBUG",
          handlers: ["console", "fileError", "fileCombined"],
        },
      },
    });
  }

  public error(message: string): void {
    error(message);
  }

  public info(message: string): void {
    info(message);
    warn("This is a warning message");
  }

  public warn(message: string): void {
    warn(message);
  }
}
