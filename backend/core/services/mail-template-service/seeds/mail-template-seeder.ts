// project
import { Database } from "@koru/database";
import { Handler } from "@koru/handler";
import { Role } from "@koru/core-models";

export const dependsOn = undefined;

export async function roleSeeder() {
  try {
    const handler: Handler = new Handler();

    const database: Database = new Database(handler.getGlobalConfig());
    await database.connect();

    const roleRepository = database.getDataSource().getRepository(Role);

    let masterRole: Role = new Role("Master", [
      "role.create",
      "role.delete",
      "role.read.all",
      "role.read.byId",
      "role.update",
      "user.create",
      "user.read.all",
      "user.read.byId",
      "user.update",
    ]);
    roleRepository.create(masterRole);
    masterRole = await roleRepository.save(masterRole);

    console.log(`Master role created with id #${masterRole.id}`);

    await database.disconnect();
  } catch (err) {
    console.error("Error seeding roles:", err);
  }
}

export default roleSeeder;
