import { BaseController, type Handler } from "@koru/microservice";
import { Dummy } from "@koru/feature-models";

export class DummyController extends BaseController<Dummy> {
  public constructor(handler: Handler) {
    super(handler, Dummy);

    this.relations = [];
    this.searchFields = ["name"];
  }
}
