import { LessThan, type Repository } from "typeorm";

import { Email } from "@koru/core-models";
import { Handler } from "@koru/handler";
import { sendEmail } from "./utils/index.ts";

function sendPendingEmails(handler: Handler): () => Promise<void> {
  return async (): Promise<void> => {
    // get a connection and repository
    const emailRepository: Repository<Email> = handler.getDatabase().getDataSource().getRepository(Email);
    // get the first email that has not been sent and has failedCount less than maxFailures
    const email: Email | null = await emailRepository.findOne({
      where: { sentAt: undefined, failedCount: LessThan(handler.getGlobalConfig().mail.maxFailures) },
      order: { createdAt: "ASC" },
    });
    // if there is no email, log it and return
    if (email == null) {
      handler.getLog().info("No pending emails");
      return;
    }
    // otherwise, send the email
    const result: boolean = await sendEmail(handler, email.recipientName, email.recipientAddress, email.subject, email.body, email.textBody);
    if (result === true) {
      email.sentAt = new Date();
      await emailRepository.save(email);
    } else {
      email.failedCount += 1;
      await emailRepository.save(email);
    }
  };
}

async function main() {
  const handler: Handler = new Handler();
  await handler.getDatabase().connect();

  sendPendingEmails(handler)();
  // const job: CronJob = new CronJob(`*/${handler.getGlobalConfig().mail.intervalSeconds} * * * * *`, sendPendingEmails(handler));

  // job.start();
}

main();

// TODO
