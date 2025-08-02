import { Router, Request, Response } from "express";

const router = Router();
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;

type ClientUploadRequest = {
  userID: string;
  fileSize: string;
  fileName: string;
};

//Resumable Upload Endpoint
router.post("/", async (req: Request, res: Response) => {
  try {
    const { userID, fileSize, fileName }: ClientUploadRequest = req.body;
    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream?direct_user=true`;
    const metadata = `name ${Buffer.from(fileName).toString("base64")}`;

    // Type-safe Header Construction
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${CLOUDFLARE_API_TOKEN}`);
    headers.append("Tus-Resumable", "1.0.0");
    headers.append("Upload-Creator", userID);
    headers.append("Upload-Length", fileSize);
    headers.append("Upload-Metadata", metadata);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: headers,
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
