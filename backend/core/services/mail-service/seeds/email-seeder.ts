// project
import { Database } from "@koru/database";
import { Handler } from "@koru/handler";
import { Email } from "@koru/core-models";

export const dependsOn = undefined;

export async function emailSeeder() {
  try {
    const handler: Handler = new Handler();

    const database: Database = new Database(handler.getGlobalConfig());
    await database.connect();

    const emailRepository = database.getDataSource().getRepository(Email);

    let testMail: Email = new Email("Marco Lisatti", "info@lisatti.com", "Tentativo di e-mail DKIM");
    testMail.body = "<b>Questo è un esempio di email inviata con firma DKIM!</b>";
    testMail.textBody = "Questo è un esempio di email inviata con firma DKIM!";

    emailRepository.create(testMail);
    testMail = await emailRepository.save(testMail);

    console.log(`Test mail created with id #${testMail.id}`);

    await database.disconnect();
  } catch (err) {
    console.error("Error seeding roles:", err);
  }
}

export default emailSeeder;
