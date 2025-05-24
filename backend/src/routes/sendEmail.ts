// src/routes/sendEmail.ts
import express, { Request, Response } from "express";
import sgMail from "@sendgrid/mail";

const router = express.Router();

sgMail.setApiKey(
  process.env.SENDGRID_API_KEY || "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"
);

// Define request body structure
type SendEmailBody = {
  filename: string;
  pdfBase64: string;
  emailTo: string; //
};

router.post("/", async (req: Request<object, unknown, SendEmailBody>, res: Response): Promise<void> => {
  const { filename, pdfBase64, emailTo } = req.body;

  // Basic validation
  if (!filename || !pdfBase64 || !emailTo) {
    res.status(400).json({ error: "Missing required fields." });
    return;
  }

  try {
    console.log("📤 Sending email to:", emailTo);
    console.log("📎 PDF size:", pdfBase64.length / 1024, "KB");
    await sgMail.send({
      to: emailTo || "shovang112233@gmail.com",
      from: process.env.SENDER_EMAIL || "shovang112233@gmail.com", // this needs to be changed to the correct email
      subject: "Your Submitted Application",
      text: "Please find your submitted application attached.",
      attachments: [
        {
          content: pdfBase64,
          filename,
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    });

    res.status(200).json({ message: "Email sent successfully!" });
  } catch (err: unknown) {
    console.error("SendGrid Error:", err instanceof Error ? err.message : err);
    res.status(500).json({ error: "Failed to send email." });
  }
});

export default router;
