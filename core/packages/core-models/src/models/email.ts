import { Column, Entity } from "typeorm";

import { BaseModel } from "./base-model.ts";

@Entity()
export class Email extends BaseModel {
  @Column({ type: "varchar", length: 255 })
  recipientName: string;

  @Column({ type: "varchar", length: 255 })
  recipientAddress: string;

  @Column({ type: "varchar", length: 255 })
  subject: string;

  @Column({ type: "text" })
  body: string;

  @Column({ type: "text", nullable: true })
  textBody?: string;

  @Column({ type: "timestamp", nullable: true })
  sentAt?: Date;

  @Column({ type: "integer", default: 0 })
  failedCount: number;

  public constructor(recipientName: string = "", recipientAddress: string = "", subject: string = "", body: string = "") {
    super();
    this.recipientName = recipientName;
    this.recipientAddress = recipientAddress;
    this.subject = subject;
    this.body = body;

    this.sentAt = undefined;
    this.failedCount = 0;
  }
}
