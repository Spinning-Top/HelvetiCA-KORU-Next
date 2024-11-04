// third party
import { hash, verify } from "@stdext/crypto/hash";
import type { JWTPayload } from "hono/utils/jwt/types";
import { sign, verify as jwtVerify } from "hono/jwt";

// project
import type { Handler } from "@koru/handler";
import type { User } from "@koru/core-models";

export class CryptoHelpers {
  public static compareStringWithHash(value: string, hash: string): boolean {
    try {
      return verify("argon2", value, hash);
    } catch {
      return false;
    }
  }

  public static generatePassword(length: number = 12): string {
    const charset: string = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789!@#$%&*()_+";
    const passwordArray: Uint8Array = new Uint8Array(length);
    crypto.getRandomValues(passwordArray);
    return Array.from(passwordArray)
      .map((byte) => charset[byte % charset.length])
      .join("");
  }

  public static isStringHashed(value: string): boolean {
    return value.startsWith("$argon2");
  }

  public static hashPassword(password: string): string {
    return hash("argon2", password);
  }

  public static async createAccessToken(handler: Handler, user: User): Promise<string> {
    // get the current timestamp
    const now: number = Math.floor(Date.now() / 1000);
    // create the access token payload
    const accessTokenPayload: JWTPayload = {
      id: user.id,
      email: user.email,
      iat: now,
      exp: now + handler.getGlobalConfig().auth.jwtAccessTokenDuration,
    };
    // create and return the access token
    return await sign(accessTokenPayload, handler.getGlobalConfig().auth.jwtSecret);
  }

  public static async createRecoveryToken(handler: Handler, user: User): Promise<string> {
    // get the current timestamp
    const now: number = Math.floor(Date.now() / 1000);
    // create the access token payload
    const accessTokenPayload: JWTPayload = {
      id: user.id,
      email: user.email,
      iat: now,
      exp: now + handler.getGlobalConfig().auth.jwtRecoveryTokenDuration,
    };
    // create and return the recovery token
    return await sign(accessTokenPayload, handler.getGlobalConfig().auth.jwtSecret);
  }

  public static async createRefreshToken(handler: Handler, user: User): Promise<{ refreshToken: string; expiresAt: Date }> {
    // get the current timestamp
    const now: number = Math.floor(Date.now() / 1000);
    // calculate the expiration for the refresh token
    const expiresAt: Date = new Date(now * 1000 + handler.getGlobalConfig().auth.jwtRefreshTokenDuration * 1000);
    expiresAt.setHours(23, 59, 59, 999);
    // create the refresh token payload
    const refreshTokenPayload: JWTPayload = {
      id: user.id,
      email: user.email,
      iat: now,
      exp: expiresAt.getTime() / 1000,
    };
    // create and return the refresh token with the expiration
    return { refreshToken: await sign(refreshTokenPayload, handler.getGlobalConfig().auth.jwtSecret), expiresAt };
  }

  public static async verifyToken(handler: Handler, token: string, user?: User): Promise<boolean> {
    // verify the refresh token
    const decodedToken: JWTPayload = await jwtVerify(token, handler.getGlobalConfig().auth.jwtSecret);
    // check if the decoded token is an object
    if (typeof decodedToken !== "object") return false;
    // check if the decoded token is null
    if (decodedToken == null) return false;
    // check if the decoded token contains the id
    if ("id" in decodedToken === false) return false;
    // if user is provided, check if the decoded token id is the same as the user id
    if (user === undefined || decodedToken.id !== user.id) return false;
    // return true if the token is valid
    return true;
  }
}
