import { BaseController } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { Dummy } from "@koru/feature-models";

export class DummyController extends BaseController<Dummy> {
  public constructor(handler: Handler) {
    super(handler, Dummy);

    this.relations = [];
    this.searchFields = ["name"];
  }
}
