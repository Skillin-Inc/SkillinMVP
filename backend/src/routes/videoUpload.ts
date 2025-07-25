import { Router, Request, Response } from "express";

const router = Router();
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ID;

//Resumable Upload Endpoint
router.post("/create-upload-url", async (req: Request, res: Response) => {
  try {
    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream?direct_user=true`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `bearer ${CLOUDFLARE_API_TOKEN}`,
        "Tus-Resumable": "1.0.0",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudflare API Error: ${response.status} ${errorText}`);
    }

    const uploadURL = response.headers.get("Location");
    if (!uploadURL) {
      throw new Error("Could not retrieve upload URL from Cloudflare");
    }
    res.json({ success: true, uploadURL });
  } catch (err) {
    console.error("Error creating upload URL:", err);
    res.status(500).json({ success: false, message: "Failed to create upload URL." });
  }
});
export default router;
