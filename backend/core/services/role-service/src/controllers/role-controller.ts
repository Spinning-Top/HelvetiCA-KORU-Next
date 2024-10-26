import { BaseController, type Handler } from "@koru/microservice";
import { Role } from "@koru/core-models";

export class RoleController extends BaseController<Role> {
  public constructor(handler: Handler) {
    super(handler, Role);

    this.relations = [];
    this.searchFields = ["name"];
  }
}
