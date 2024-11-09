// third party
import { Expose, Transform } from "class-transformer";

// local
import { LinkedUser } from "./linked-user.ts";
import { RootEntity } from "./root-entity.ts";
import type { User } from "./user.ts";

export class RefreshToken extends RootEntity {
  @Expose({ groups: ["database", "json", "read", "create"] })
  @Transform(({ value }) => new LinkedUser(value), { toPlainOnly: true })
  user!: User;

  @Expose({ groups: ["database", "json", "read", "create"] })
  token!: string;

  @Expose({ groups: ["database", "json", "read", "create"] })
  expiresAt!: Date;
}
