import { BaseController } from "@koru/base-service";
import { Dummy } from "@koru/feature-models";
import type { Handler } from "@koru/handler";

export class DummyController extends BaseController<Dummy> {
  public constructor(handler: Handler) {
    super(handler, Dummy);

    this.relations = [];
    this.searchFields = ["name"];
  }
}
