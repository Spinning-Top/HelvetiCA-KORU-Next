// project
import { Database } from "@koru/database";
import { Handler } from "@koru/handler";
import { Role, User } from "@koru/core-models";

export const dependsOn = "role-seeder";

export async function userSeeder() {
  try {
    const handler: Handler = new Handler();

    const database: Database = new Database(handler.getGlobalConfig());
    await database.connect();

    const roleRepository = database.getDataSource().getRepository(Role);
    const userRepository = database.getDataSource().getRepository(User);

    const roles: Role[] = await roleRepository.find();

    let masterUser: User = new User("marco@spinningtop.it", "Marco", "Lisatti");
    masterUser.locale = handler.getGlobalConfig().koru.defaultLocale;
    masterUser.theme = handler.getGlobalConfig().koru.defaultTheme;
    masterUser.password = "Password123!";
    masterUser.roles = [roles[0]];
    const newPassword: string = masterUser.password;

    userRepository.create(masterUser);
    masterUser = await userRepository.save(masterUser);

    console.log(`Master user created with id #${masterUser.id} (password: ${newPassword})`);

    await database.disconnect();
  } catch (err) {
    console.error("Error seeding users:", err);
  }
}

export default userSeeder;
