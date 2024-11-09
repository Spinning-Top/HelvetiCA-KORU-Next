// third party
import { Expose, Transform } from "class-transformer";
import { IsEmail, Length } from "class-validator";

// project
import { CryptoHelpers } from "@koru/crypto-helpers";

// local
import { LinkedRole } from "./linked-role.ts";
import { Locale, Theme } from "../support/index.ts";
import { RefreshToken } from "./refresh-token.ts";
import type { Role } from "./role.ts";
import { RootEntity } from "./root-entity.ts";

export class User extends RootEntity {
  @IsEmail()
  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  email!: string;

  @Expose({ groups: ["database", "json", "create", "update"] })
  password: string = CryptoHelpers.generatePassword();

  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  passwordExpiresAt?: Date;

  @Length(1, 255)
  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  firstName!: string;

  @Length(1, 255)
  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  lastName!: string;

  @Expose({ groups: ["database", "json", "read", "internalUpdate"] })
  lastSeen?: Date;

  @Expose({ groups: ["database", "json", "read", "update"] })
  isActive: boolean = true;

  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  @Transform(({ value }) => (value !== undefined ? (value as Role[]).map((role) => new LinkedRole(role)) : undefined), { toPlainOnly: true })
  roles!: Role[];

  @Expose({ groups: ["database", "json", "internalUpdate"] })
  refreshTokens!: RefreshToken[];

  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  locale: Locale = Locale.English;

  @Expose({ groups: ["database", "json", "read", "create", "update"] })
  theme: Theme = Theme.Light;

  public addRefreshToken(token: string, expiresAt: Date): void {
    if (this.refreshTokens === undefined) this.refreshTokens = [];

    const newRefreshToken: RefreshToken = new RefreshToken();
    newRefreshToken.user = this;
    newRefreshToken.token = token;
    newRefreshToken.expiresAt = expiresAt;

    this.refreshTokens.push(newRefreshToken);
  }

  public removeRefreshToken(token: string): void {
    if (this.refreshTokens === undefined) this.refreshTokens = [];

    this.refreshTokens = this.refreshTokens.filter((refreshToken) => CryptoHelpers.compareStringWithHash(token, refreshToken.token) === false);
  }

  public hasRefreshToken(token: string): boolean {
    if (this.refreshTokens === undefined) this.refreshTokens = [];

    return this.refreshTokens.some((refreshToken) => CryptoHelpers.compareStringWithHash(token, refreshToken.token) === true);
  }

  public hasPermission(permission: string): boolean {
    return this.roles.some((role) => role.permissions.includes(permission));
  }
}
