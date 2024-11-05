// project
import { BaseController } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { Role } from "@koru/core-models";

export class RoleController extends BaseController<Role> {
  public constructor(handler: Handler) {
    super(handler, Role);

    this.relations = [];
    this.searchFields = ["name"];
  }
}
