// third party
import { IsNull, LessThan, type Repository } from "typeorm";
// project
import { Email } from "@koru/core-models";
import { Handler } from "@koru/handler";

// local
import { sendEmail } from "./utils/index.ts";

function sendPendingEmails(handler: Handler): () => Promise<void> {
  return async (): Promise<void> => {
    // get a connection and repository
    const emailRepository: Repository<Email> = handler.getDatabase().getDataSource().getRepository(Email);
    // get the first email that has not been sent and has failedCount less than maxFailures
    const email: Email | null = await emailRepository.findOne({
      where: { sentAt: IsNull(), failedCount: LessThan(handler.getGlobalConfig().mail.maxFailures) },
      order: { createdAt: "ASC" },
    });
    // if there is no email, return
    if (email == null) return;
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
  const handler: Handler = new Handler("Mail Service");
  await handler.getDatabase().connect();

  let intervalId: number = -1;

  // Ascolta il segnale SIGTERM
  Deno.addSignalListener("SIGTERM", () => {
    console.log("MAIL SIGTERM received: shutting down gracefully...");
    // stop the interval
    clearInterval(intervalId);
  });

  // Ascolta il segnale SIGINT (CTRL+C) se vuoi supportarlo
  Deno.addSignalListener("SIGINT", () => {
    console.log("MAIL SIGINT received: shutting down gracefully...");
    // stop the interval
    clearInterval(intervalId);
  });

  intervalId = setInterval(sendPendingEmails(handler), handler.getGlobalConfig().mail.sendInterval * 1000);
}

main();
