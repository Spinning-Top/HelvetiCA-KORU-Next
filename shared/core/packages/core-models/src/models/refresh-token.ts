import { BeforeInsert, BeforeUpdate, Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Expose, Transform } from "class-transformer";

import { CryptoHelpers } from "@koru/crypto-helpers";
import { LinkedUser } from "./linked-user.ts";
import { User } from "./user.ts";
import type { User as UserType } from "./user.ts";

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  @Expose({ groups: ["fromJson", "toJson"] })
  id!: number;

  @Index()
  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: "CASCADE" })
  @Expose({ groups: ["fromJson", "toJson"] })
  @Transform(({ value }) => (value ? (value as User[]).map((role) => new LinkedUser(role)) : null), { toPlainOnly: true })
  user!: UserType;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 255 })
  @Expose({ groups: ["fromJson", "toJson"] })
  token!: string;

  @Index()
  @Column({ type: "timestamp" })
  @Expose({ groups: ["fromJson", "toJson"] })
  expiresAt!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  hashToken() {
    if (CryptoHelpers.isStringHashed(this.token) === false) this.token = CryptoHelpers.hashPassword(this.token);
  }

  public constructor(user: UserType, token: string, expiresAt: Date) {
    this.user = user;
    this.token = token;
    this.expiresAt = expiresAt;
  }
}
