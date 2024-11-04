// third party
import { BeforeInsert, BeforeUpdate, Column, Entity, Index, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { Expose, Transform } from "class-transformer";
import { IsEmail, Length } from "class-validator";

// project
import { CryptoHelpers } from "@koru/crypto-helpers";

// local
import { BaseModel } from "./base-model.ts";
import { LinkedRole } from "./linked-role.ts";
import { RefreshToken } from "./refresh-token.ts";
import { Role } from "./role.ts";

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

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user, { cascade: true, orphanedRowAction: "delete" })
  @Expose({ groups: ["update", "fromJson", "toJson"] })
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

  public addRefreshToken(token: string, expiresAt: Date): void {
    if (this.refreshTokens === undefined) this.refreshTokens = [];

    const newRefreshToken: RefreshToken = new RefreshToken(this, token, expiresAt);
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
