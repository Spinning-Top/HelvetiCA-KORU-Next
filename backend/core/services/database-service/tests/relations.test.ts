// third party
import { assertEquals, assertExists } from "@std/assert";

// project
import { RefreshToken, User } from "@koru/core-entities";
import { RefreshTokenModel, UserModel } from "@koru/core-models";

// local
import { DatabaseService } from "../src/database-service.ts";

Deno.test("Database operations", async (t: Deno.TestContext) => {
  const databaseService: DatabaseService = new DatabaseService();
  await databaseService.connect();
  await databaseService.getDataSource().synchronize(true);

  let userId: number = 0;
  let refreshTokenId: number = 0;

  await t.step("Create user", async () => {
    const user: User = new User();
    user.email = "average.joe@gmail.com";
    user.firstName = "Average";
    user.lastName = "Joe";
    user.passwordExpiresAt = new Date();

    const userModel: UserModel = UserModel.fromEntity(user, UserModel);

    const createdUserModel: UserModel | undefined = await databaseService.createEntity(UserModel, userModel);

    assertExists(createdUserModel);

    userId = createdUserModel.id;

    assertEquals(userModel.toJson(), createdUserModel.toJson());
  });

  await t.step("Create refresh token", async () => {
    const userModelById: UserModel | undefined = await databaseService.readEntityById(UserModel, userId);

    assertExists(userModelById);

    const refreshToken: RefreshToken = new RefreshToken();
    refreshToken.user = userModelById.toEntity(User);
    refreshToken.token = "ABC123";
    refreshToken.expiresAt = new Date();

    const refreshTokenModel: RefreshTokenModel = RefreshTokenModel.fromEntity(refreshToken, RefreshTokenModel);

    const createdRefreshTokenModel: RefreshTokenModel | undefined = await databaseService.createEntity(RefreshTokenModel, refreshTokenModel);

    assertExists(createdRefreshTokenModel);

    refreshTokenId = createdRefreshTokenModel.id;
  });

  await t.step("Read user by id", async () => {
    const userModelById: UserModel | undefined = await databaseService.readEntityById(UserModel, userId, ["roles", "refreshTokens"]);

    assertExists(userModelById);
  });

  await t.step("Read refresh token by id", async () => {
    const refreshTokenModelById: RefreshTokenModel | undefined = await databaseService.readEntityById(RefreshTokenModel, refreshTokenId, [
      "user.roles",
    ]);

    assertExists(refreshTokenModelById);

    const refreshToken: RefreshToken = refreshTokenModelById.toEntity(RefreshToken);

    assertEquals(refreshToken.id, refreshTokenId);
  });

  await databaseService.disconnect();
});
