import { BaseController } from "@koru/base-service";
import { CronJob } from "@koru/core-models";
import type { Handler } from "@koru/handler";

export class CronJobController extends BaseController<CronJob> {
  public constructor(handler: Handler) {
    super(handler, CronJob);

    this.relations = [];
    this.searchFields = [];
  }
}
