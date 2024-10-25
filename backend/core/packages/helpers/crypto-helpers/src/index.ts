import { hash, verify } from "@stdext/crypto/hash";

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
}
