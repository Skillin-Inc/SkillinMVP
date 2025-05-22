import express, { Request, Response } from "express";
import sgMail from "@sendgrid/mail";

const router = express.Router();

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

router.post("/", async (req: Request, res: Response) => {
  const { filename, pdfBase64, emailTo } = req.body;

  if (!filename || !pdfBase64 || !emailTo) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    await sgMail.send({
      to: emailTo,
      from: process.env.SENDER_EMAIL || "", // Must match a verified sender
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
  } catch (err) {
    console.error("SendGrid Error:", err.response?.body || err);
    res.status(500).json({ error: "Failed to send email." });
  }
});

export default router;
