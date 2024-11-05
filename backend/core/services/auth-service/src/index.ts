// project
import { MicroService } from "@koru/micro-service";

// local
import {
  loginEndpoint,
  logoutEndpoint,
  passwordChangeEndpoint,
  passwordForgotEndpoint,
  passwordResetEndpoint,
  profileEndpoint,
  refreshTokenEndpoint,
  registerEndpoint,
  validateTokenEndpoint,
} from "./endpoints/index.ts";

const microService: MicroService = new MicroService("Auth Service", 9201, "/auth");

export function startService(): Promise<void> {
  // endpoints
  microService.setEndpoints([
    // login endpoint
    loginEndpoint(microService.getHandler()),
    // logout endpoint
    logoutEndpoint(microService.getHandler()),
    // password change endpoint
    passwordChangeEndpoint(microService.getHandler()),
    // password forgot endpoint
    passwordForgotEndpoint(microService.getHandler()),
    // password reset endpoint
    passwordResetEndpoint(microService.getHandler()),
    // profile endpoint
    profileEndpoint(microService.getHandler()),
    // refresh token endpoint
    refreshTokenEndpoint(microService.getHandler()),
    // register endpoint
    registerEndpoint(microService.getHandler()),
    // validate token endpoint
    validateTokenEndpoint(microService.getHandler()),
  ]);

  // start service
  return microService.start();
}

export function stopService(): Promise<void> {
  // stop service
  return microService.stop();
}

startService();
