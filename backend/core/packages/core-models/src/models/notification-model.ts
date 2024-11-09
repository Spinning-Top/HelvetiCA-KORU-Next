// third party
import { Column, Entity } from "typeorm";
import { Expose } from "class-transformer";

// local
import { RootModel } from "./root-model.ts";

@Entity()
export class NotificationModel extends RootModel {
  @Column({ type: "varchar", length: 255 })
  @Expose({ groups: ["database", "json", "read", "create"] })
  type!: string;

  @Column({ type: "json", default: [] })
  @Expose({ groups: ["database", "json", "read", "create"] })
  targetUsers!: string[];

  @Column({ type: "json", default: [] })
  @Expose({ groups: ["database", "json", "read", "internalUpdate"] })
  readBy!: string[];

  @Column({ type: "json", default: [] })
  @Expose({ groups: ["database", "json", "read", "internalUpdate"] })
  dismissedBy!: string[];
}
