// third party
import { assert, assertEquals } from "@std/assert";

// local
import { CryptoHelpers } from "../src/index.ts";

const passwordLength: number = 12;

const testPassword: string = CryptoHelpers.generatePassword(passwordLength);
const hashedTestPassword: string = CryptoHelpers.hashPassword(testPassword);

const testPassword2: string = CryptoHelpers.generatePassword(passwordLength + 1);
const hashedTestPassword2: string = CryptoHelpers.hashPassword(testPassword2);

Deno.test("CryptoHelpers.generatePassword", () => {
  assert(testPassword.length === passwordLength, "password length is not correct");
  assert(testPassword2.length !== passwordLength, "password length is not correct");
});

Deno.test("CryptoHelpers.isStringHashed", () => {
  assertEquals(CryptoHelpers.isStringHashed(testPassword), false, "password is hashed");
  assertEquals(CryptoHelpers.isStringHashed(hashedTestPassword), true, "hashed password is not hashed");
  assertEquals(CryptoHelpers.isStringHashed("random string"), false, "random string is hashed");
});

Deno.test("CryptoHelpers.compareStringWithHash", () => {
  assertEquals(CryptoHelpers.compareStringWithHash(testPassword, hashedTestPassword), true, "passwords do not match");
  assertEquals(CryptoHelpers.compareStringWithHash(testPassword, hashedTestPassword2), false, "passwords match");
  assertEquals(CryptoHelpers.compareStringWithHash(testPassword, "random string"), false, "passwords match");
});
