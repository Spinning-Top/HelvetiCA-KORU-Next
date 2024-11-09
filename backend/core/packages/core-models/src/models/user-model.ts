// third party
import { BeforeInsert, BeforeUpdate, Column, Entity, Index, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { Expose } from "class-transformer";

// project
import { CryptoHelpers } from "@koru/crypto-helpers";

// local
import { Locale, Theme } from "@koru/core-entities";
import { RefreshTokenModel } from "./refresh-token-model.ts";
import { RoleModel } from "./role-model.ts";
import { RootModel } from "./root-model.ts";

@Entity()
export class UserModel extends RootModel {
  @Index({ unique: true })
  @Column({ type: "varchar", length: 255, unique: true })
  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  email!: string;

  @Column({ type: "varchar", length: 255, default: CryptoHelpers.generatePassword() })
  @Expose({ groups: ["database", "json", "create", "update"] })
  password!: string;

  @Column({ type: "timestamp", nullable: true })
  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  passwordExpiresAt?: Date;

  @Column({ type: "varchar", length: 255 })
  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  firstName!: string;

  @Column({ type: "varchar", length: 255 })
  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  lastName!: string;

  @Column({ type: "timestamp", nullable: true })
  @Expose({ groups: ["database", "json", "read", "internalUpdate"] })
  lastSeen?: Date;

  @Column({ type: "boolean", default: true })
  @Expose({ groups: ["database", "json", "read", "update"] })
  isActive!: boolean;

  @ManyToMany(() => RoleModel)
  @JoinTable()
  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  roles!: RoleModel[];

  @OneToMany(() => RefreshTokenModel, (refreshToken) => refreshToken.user, { cascade: true, orphanedRowAction: "delete" })
  @Expose({ groups: ["database", "json", "internalUpdate"] })
  refreshTokens!: RefreshTokenModel[];

  @Column({ type: "enum", enum: Locale, default: Locale.English })
  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  locale!: Locale;

  @Column({ type: "enum", enum: Theme, default: Theme.Light })
  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  theme!: Theme;

  @BeforeInsert()
  @BeforeUpdate()
  hashPassword() {
    if (CryptoHelpers.isStringHashed(this.password) === false) this.password = CryptoHelpers.hashPassword(this.password);
  }
}
