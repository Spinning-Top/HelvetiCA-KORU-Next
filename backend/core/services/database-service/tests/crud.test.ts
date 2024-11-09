// third party
import { assertEquals, assertExists } from "@std/assert";

// project
import { type ReadWithParamsResult, User } from "@koru/core-entities";
import { UserModel } from "@koru/core-models";

// local
import { DatabaseService } from "../src/database-service.ts";

Deno.test("Database operations", async (t: Deno.TestContext) => {
  const databaseService: DatabaseService = new DatabaseService();
  await databaseService.connect();
  await databaseService.getDataSource().synchronize(true);

  let userId1: number = 0;
  let userId2: number = 0;

  await t.step("Create user", async () => {
    const user: User = new User();
    user.email = "average.joe@gmail.com";
    user.firstName = "Average";
    user.lastName = "Joe";
    user.passwordExpiresAt = new Date();

    const userModel: UserModel = UserModel.fromEntity(user, UserModel);

    const createdUserModel1: UserModel | undefined = await databaseService.createEntity(UserModel, userModel);

    assertExists(createdUserModel1);

    userId1 = createdUserModel1.id;

    assertEquals(userModel.toJson(), createdUserModel1.toJson());
  });

  await t.step("Read user by id", async () => {
    const userById: UserModel | undefined = await databaseService.readEntityById(UserModel, userId1, ["roles"]);

    assertExists(userById);

    const unknownUserById: UserModel | undefined = await databaseService.readEntityById(UserModel, 999, ["roles"]);

    assertEquals(unknownUserById === undefined, true);
  });

  await t.step("Read user by e-mail", async () => {
    const userByEmail: UserModel | undefined = await databaseService.readEntityByField(UserModel, "email", "average.joe@gmail.com", ["roles"]);

    assertExists(userByEmail);

    const unknownUserByEmail: UserModel | undefined = await databaseService.readEntityByField(UserModel, "email", "unknown@unknown.com", ["roles"]);

    assertEquals(unknownUserByEmail === undefined, true);
  });

  await t.step("Read all users", async () => {
    const user2: User = new User();
    user2.email = "john.doe@gmail.com";
    user2.firstName = "John";
    user2.lastName = "Doe";
    user2.passwordExpiresAt = new Date();

    const userModel2: UserModel = UserModel.fromEntity(user2, UserModel);

    const createdUserModel2: UserModel | undefined = await databaseService.createEntity(UserModel, userModel2);

    assertExists(createdUserModel2);

    userId2 = createdUserModel2.id;

    const users: UserModel[] = await databaseService.readAllEntities(UserModel, ["roles"]);

    assertEquals(users.length, 2);
  });

  await t.step("Read users with params", async () => {
    const users: ReadWithParamsResult = await databaseService.readEntitiesWithParams(UserModel, 1, 1, undefined, [], ["roles"]);

    assertEquals(users.getEntities().length, 1, "Entities length");
    assertEquals(users.getTotal(), 2, "Total");
    assertEquals(users.getPage(), 1, "Page");
    assertEquals(users.getLimit(), 1, "Limit");
  });

  await t.step("Update user", async () => {
    const updateResult: boolean = await databaseService.updateEntity(UserModel, userId1, { firstName: "Nunzio" });

    assertEquals(updateResult, true);
  });

  await t.step("Read updated user by id", async () => {
    const userById: UserModel | undefined = await databaseService.readEntityById(UserModel, userId1, ["roles"]);

    assertExists(userById);

    assertEquals(userById.firstName, "Nunzio");
  });

  await t.step("Soft delete user", async () => {
    const deleteResult: boolean = await databaseService.softDeleteEntity(UserModel, userId1);

    assertEquals(deleteResult, true);
  });

  await t.step("Read deleted users", async () => {
    const users: UserModel[] = await databaseService.readDeletedEntities(UserModel, ["roles"]);

    assertEquals(users.length, 1);
  });

  await t.step("Delete user", async () => {
    const deleteResult: boolean = await databaseService.softDeleteEntity(UserModel, userId2);

    assertEquals(deleteResult, true);
  });

  await t.step("Read again all users", async () => {
    const users: UserModel[] = await databaseService.readAllEntities(UserModel, ["roles"]);

    assertEquals(users.length, 0);
  });

  await databaseService.disconnect();
});
