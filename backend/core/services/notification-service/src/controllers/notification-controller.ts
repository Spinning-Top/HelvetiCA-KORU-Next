import { BaseController } from "@koru/base-service";
import type { Handler } from "@koru/handler";
import { Notification } from "@koru/core-models";

export class NotificationController extends BaseController<Notification> {
  public constructor(handler: Handler) {
    super(handler, Notification);

    this.relations = [];
    this.searchFields = [];
  }
}
