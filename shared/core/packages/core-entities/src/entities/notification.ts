// third party
import { Expose } from "class-transformer";
import { IsEmail } from "class-validator";

// local
import { RootEntity } from "./root-entity.ts";

export class Notification extends RootEntity {
  @IsEmail()
  @Expose({ groups: ["database", "json", "read", "create"] })
  type!: string;

  @Expose({ groups: ["database", "json", "read", "create"] })
  targetUsers: string[] = [];

  @Expose({ groups: ["database", "json", "read", "internalUpdate"] })
  readBy: string[] = [];

  @Expose({ groups: ["database", "json", "read", "internalUpdate"] })
  dismissedBy: string[] = [];
}
