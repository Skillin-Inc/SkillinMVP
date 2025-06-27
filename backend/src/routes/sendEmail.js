"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/sendEmail.ts
const express_1 = __importDefault(require("express"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
const router = express_1.default.Router();
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY || "");
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { filename, pdfBase64, emailTo } = req.body;
    // Basic validation
    if (!filename || !pdfBase64 || !emailTo) {
        res.status(400).json({ error: "Missing required fields." });
        return;
    }
    try {
        console.log("📤 Sending email to:", emailTo);
        console.log("📎 PDF size:", pdfBase64.length / 1024, "KB");
        yield mail_1.default.send({
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
    }
    catch (err) {
        console.error("SendGrid Error:", err instanceof Error ? err.message : err);
        res.status(500).json({ error: "Failed to send email." });
    }
}));
exports.default = router;
