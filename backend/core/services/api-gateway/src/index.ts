import { Gateway } from "./gateway.ts";

const gateway: Gateway = new Gateway();

export async function startService(): Promise<void> {
  // start service
  return await gateway.start();
}

export async function stopService(): Promise<void> {
  // stop service
  return await gateway.stop();
}

startService();
