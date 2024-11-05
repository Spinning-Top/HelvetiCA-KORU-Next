// third party
import { BeforeInsert, BeforeUpdate, Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Expose, Transform } from "class-transformer";

// project
import { CryptoHelpers } from "@koru/crypto-helpers";

// local
import { LinkedUser } from "./linked-user.ts";
import { User } from "./user.ts";

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  @Expose({ groups: ["fromJson", "toJson"] })
  id!: number;

  @Index()
  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: "CASCADE", orphanedRowAction: "delete" })
  @Expose({ groups: ["fromJson", "toJson"] })
  @Transform(({ value }) => new LinkedUser(value), { toPlainOnly: true })
  user!: User;

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

  public constructor(user: User, token: string, expiresAt: Date) {
    this.user = user;
    this.token = token;
    this.expiresAt = expiresAt;
  }
}
