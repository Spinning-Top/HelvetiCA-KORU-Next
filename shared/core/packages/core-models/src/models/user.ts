import { BeforeInsert, BeforeUpdate, Column, Entity, Index, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { Expose, Transform } from "class-transformer";
import { IsEmail, Length } from "class-validator";

import { BaseModel } from "./base-model.ts";
import { CryptoHelpers } from "@koru/crypto-helpers";
import { getGlobalConfig, type GlobalConfig } from "@koru/global-config";
import { LinkedRole } from "./linked-role.ts";
import { Role } from "./role.ts";
import { RefreshToken } from "./refresh-token.ts";

@Entity()
export class User extends BaseModel {
  @Index({ unique: true })
  @Column({ type: "varchar", length: 255, unique: true })
  @IsEmail()
  @Expose({ groups: ["read", "create", "fromJson", "toJson"] })
  email!: string;

  @Column({ type: "varchar", length: 255 })
  @Expose({ groups: ["fromJson", "toJson"] })
  password!: string;

  @Column({ type: "timestamp", nullable: true })
  @Expose({ groups: ["read", "fromJson", "toJson"] })
  passwordExpiresAt?: Date;

  @Column({ type: "varchar", length: 255 })
  @Length(1, 255)
  @Expose({ groups: ["read", "create", "update", "fromJson", "toJson"] })
  firstName!: string;

  @Column({ type: "varchar", length: 255 })
  @Length(1, 255)
  @Expose({ groups: ["read", "create", "update", "fromJson", "toJson"] })
  lastName!: string;

  @Column({ type: "timestamp", nullable: true })
  @Expose({ groups: ["read", "fromJson", "toJson"] })
  lastSeen?: Date;

  @Column({ type: "boolean", default: true })
  @Expose({ groups: ["read", "fromJson", "toJson"] })
  isActive!: boolean;

  @ManyToMany(() => Role)
  @JoinTable()
  @Expose({ groups: ["read", "fromJson", "toJson"] })
  @Transform(({ value }) => (value ? (value as Role[]).map((role) => new LinkedRole(role)) : null), { toPlainOnly: true })
  roles!: Role[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  @Expose({ groups: ["fromJson", "toJson"] })
  refreshTokens!: RefreshToken[];

  @BeforeInsert()
  @BeforeUpdate()
  hashPassword() {
    if (CryptoHelpers.isStringHashed(this.password) === false) this.password = CryptoHelpers.hashPassword(this.password);
  }

  public constructor(email: string = "", firstName: string = "", lastName: string = "", passwordExpiresAt?: Date) {
    super();
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.passwordExpiresAt = passwordExpiresAt;

    this.password = CryptoHelpers.generatePassword();
    this.lastSeen = undefined;
    this.isActive = true;
  }

  public addRefreshToken(token: string): void {
    if (this.refreshTokens === undefined) this.refreshTokens = [];

    const globalConfig: GlobalConfig = getGlobalConfig();

    if (CryptoHelpers.isStringHashed(token) === false) token = CryptoHelpers.hashPassword(token);

    const expiresAt: Date = new Date(Date.now() + 1000 * 60 * 60 * 24 * Number(globalConfig.auth.jwtRefreshTokenDuration.replace("d", "")));
    expiresAt.setHours(23, 59, 59, 999);

    const newRefreshToken: RefreshToken = new RefreshToken(this, token, expiresAt);
    this.refreshTokens.push(newRefreshToken);
  }

  public removeRefreshToken(token: string): void {
    if (this.refreshTokens === undefined) this.refreshTokens = [];

    if (CryptoHelpers.isStringHashed(token) === false) token = CryptoHelpers.hashPassword(token);

    this.refreshTokens = this.refreshTokens.filter((refreshToken) => refreshToken.token !== token);
  }

  public hasRefreshToken(token: string): boolean {
    if (this.refreshTokens === undefined) this.refreshTokens = [];

    token = CryptoHelpers.hashPassword(token);
    return this.refreshTokens.some((refreshToken) => refreshToken.token === token);
  }

  public hasPermission(permission: string): boolean {
    return this.roles.some((role) => role.permissions.includes(permission));
  }
}
