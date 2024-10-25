import type { Express } from "express";

import { AuthHelpers } from "@koru/auth-helpers";
import { Microservice } from "@koru/microservice";

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

const microservice: Microservice = new Microservice("Auth Service", "/auth");
export const express: Express = microservice.getHandler().getExpress();

export function startService(): Promise<void> {
  // endpoints
  microservice.setEndpoints([
    // login endpoint
    loginEndpoint(microservice.getHandler()),
    // logout endpoint
    logoutEndpoint(microservice.getHandler()),
    // password change endpoint
    passwordChangeEndpoint(microservice.getHandler()),
    // password forgot endpoint
    passwordForgotEndpoint(microservice.getHandler()),
    // password reset endpoint
    passwordResetEndpoint(microservice.getHandler()),
    // profile endpoint
    profileEndpoint(microservice.getHandler()),
    // refresh token endpoint
    refreshTokenEndpoint(microservice.getHandler()),
    // register endpoint
    registerEndpoint(microservice.getHandler()),
    // validate token endpoint
    validateTokenEndpoint(microservice.getHandler()),
  ]);

  // init passport
  AuthHelpers.initPassport(
    microservice.getHandler().getGlobalConfig().auth.jwtSecret,
    microservice.getHandler().getExpress(),
    microservice.getHandler().getRabbitBreeder()
  );

  // start service
  return microservice.start();
}

export function stopService(): Promise<void> {
  // stop service
  return microservice.stop();
}

startService();
