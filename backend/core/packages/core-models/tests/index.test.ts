// third party
import { assertEquals } from "@std/assert";

// project
import { User } from "@koru/core-entities";

// local
import { UserModel } from "../src/index.ts";

Deno.test("From User to UserModel", () => {
  const user: User = new User();
  user.email = "average.joe@gmail.com";
  user.firstName = "Average";
  user.lastName = "Joe";
  user.passwordExpiresAt = new Date();

  const userModel: UserModel = UserModel.fromEntity(user, UserModel);

  assertEquals(user.toJson(), userModel.toJson());
});

Deno.test("From UserModel to User", () => {
  const userModel: UserModel = new UserModel();
  userModel.email = "average.joe@gmail.com";
  userModel.firstName = "Average";
  userModel.lastName = "Joe";
  userModel.passwordExpiresAt = new Date();

  const user: User = userModel.toEntity(User);

  assertEquals(userModel.toJson(), user.toJson());
});
