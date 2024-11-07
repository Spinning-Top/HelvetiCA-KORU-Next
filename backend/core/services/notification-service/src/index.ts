import { MicroService } from "@koru/micro-service";

import { readNotificationEndpoint, readNotificationsEndpoint, updateNotificationEndpoint } from "./endpoints/index.ts";

const microService: MicroService = new MicroService("Notification Service");

export function startService(): Promise<void> {
  // endpoints
  microService.setEndpoints([
    // read notifications endpoint
    readNotificationsEndpoint(microService.getHandler()),
    // read notification endpoint
    readNotificationEndpoint(microService.getHandler()),
    // update notification endpoint
    updateNotificationEndpoint(microService.getHandler()),
  ]);

  // start service
  return microService.start();
}

export function stopService(): Promise<void> {
  return microService.stop();
}

startService();
