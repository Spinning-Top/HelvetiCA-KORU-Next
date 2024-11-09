// local
import { enrollServiceRabbit } from "./rabbits/index.ts";
import { faviconEndpoint, rootEndpoint, wildcardEndpoint } from "./endpoints/index.ts";
import { Gateway } from "./gateway.ts";

const gateway: Gateway = new Gateway();

export async function startService(): Promise<void> {
  // endpoints
  gateway.setEndpoints([
    // root endpoint
    rootEndpoint(gateway.getHandler()),
    // favicon endpoint
    faviconEndpoint(),
    // wildcard endpoint
    wildcardEndpoint(gateway.getGatewayServices(), gateway.getHandler()),
  ]);

  // rabbits
  gateway.setRabbits([
    // enroll service rabbit
    enrollServiceRabbit(gateway.getHandler(), gateway),
  ]);

  // start service
  return await gateway.start();
}

export async function stopService(): Promise<void> {
  // stop service
  return await gateway.stop();
}

startService();
