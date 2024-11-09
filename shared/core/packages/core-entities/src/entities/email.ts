// third party
import { Expose } from "class-transformer";

// local
import { BaseEntity } from "./base-entity.ts";

export class Email extends BaseEntity {
  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  recipientName!: string;

  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  recipientAddress!: string;

  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  subject!: string;

  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  body!: string;

  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  textBody?: string;

  @Expose({ groups: ["database", "json", "read", "internalUpdate"] })
  sentAt?: Date;

  @Expose({ groups: ["database", "json", "read", "internalUpdate"] })
  failedCount: number = 0;
}
