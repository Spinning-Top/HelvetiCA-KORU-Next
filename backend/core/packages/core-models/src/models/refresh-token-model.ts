// third party
import { BeforeInsert, BeforeUpdate, Column, Entity, Index, ManyToOne } from "typeorm";
import { Expose } from "class-transformer";

// project
import { CryptoHelpers } from "@koru/crypto-helpers";

// local
import { RootModel } from "./root-model.ts";
import { UserModel } from "./user-model.ts";

@Entity()
export class RefreshTokenModel extends RootModel {
  @Index()
  @ManyToOne(() => UserModel, (user) => user.refreshTokens, { onDelete: "CASCADE", orphanedRowAction: "delete" })
  @Expose({ groups: ["database", "json", "read", "create"] })
  user!: UserModel;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 255 })
  @Expose({ groups: ["database", "json", "read", "create"] })
  token!: string;

  @Index()
  @Column({ type: "timestamp" })
  @Expose({ groups: ["database", "json", "read", "create"] })
  expiresAt!: Date;

  @BeforeInsert()
  @BeforeUpdate()
  hashToken() {
    if (CryptoHelpers.isStringHashed(this.token) === false) this.token = CryptoHelpers.hashPassword(this.token);
  }
}
