// third party
import { Column, Entity } from "typeorm";
import { Expose } from "class-transformer";

// local
import { BaseModel } from "./base-model.ts";

@Entity()
export class EmailModel extends BaseModel {
  @Column({ type: "varchar", length: 255 })
  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  recipientName!: string;

  @Column({ type: "varchar", length: 255 })
  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  recipientAddress!: string;

  @Column({ type: "varchar", length: 255 })
  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  subject!: string;

  @Column({ type: "text" })
  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  body!: string;

  @Column({ type: "text", nullable: true })
  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  textBody?: string;

  @Column({ type: "timestamp", nullable: true })
  @Expose({ groups: ["database", "json", "read", "internalUpdate"] })
  sentAt?: Date;

  @Column({ type: "integer", default: 0 })
  @Expose({ groups: ["database", "json", "read", "internalUpdate"] })
  failedCount!: number;
}
