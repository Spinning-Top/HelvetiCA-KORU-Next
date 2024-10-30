import { createTransport, type SendMailOptions, type SentMessageInfo, type Transporter } from "nodemailer";
import dkim from "nodemailer-dkim";
import { readFileSync } from "node:fs";

import type { Handler } from "@koru/handler";

export function sendEmail(
  handler: Handler,
  recipientName: string,
  recipientAddres: string,
  subject: string,
  body: string,
  textBody?: string,
): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // create reusable transporter object using the default SMTP transport
      const transporter: Transporter = createTransport({
        host: handler.getGlobalConfig().mail.host,
        port: handler.getGlobalConfig().mail.port,
        secure: false,
        tls: {
          rejectUnauthorized: false,
        },
      });
      // use DKIM
      transporter.use(
        "sign",
        dkim.signer({
          domainName: handler.getGlobalConfig().mail.domain,
          keySelector: handler.getGlobalConfig().mail.selector,
          privateKey: readFileSync(handler.getGlobalConfig().mail.privateKeyPath, "utf8"),
        }),
      );
      // set mail options
      const mailOptions: SendMailOptions = {
        from: `"${handler.getGlobalConfig().mail.senderName}" <${handler.getGlobalConfig().mail.senderAddress}>`,
        to: `"${recipientName}" <${recipientAddres}>`,
        subject: subject,
        text: textBody || body,
        html: textBody !== undefined && body !== textBody ? body : undefined,
      };
      // send mail with defined transport object
      transporter.sendMail(mailOptions, (error: Error | null, info: SentMessageInfo) => {
        if (error) {
          handler.getLog().error(`E-mail sending error: ${error}`);
          return resolve(false);
        }
        handler.getLog().info(`E-mail sent: ${info.response}`);
        return resolve(true);
      });
    } catch (error) {
      console.error("Error sending email:", error);
      return resolve(false);
    }
  });
}
