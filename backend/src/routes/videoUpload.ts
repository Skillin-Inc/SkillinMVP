import { Router, Request, Response } from "express";
import Cloudflare from "cloudflare";
import { DirectUploadCreateResponse } from "cloudflare/resources/stream/direct-upload";

const router = Router();
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const cloudflareID = "placeholder";

// Direct Upload (for testing, 200MB max)
router.post("/", async (req: Request, res: Response) => {
  try {
    const { reqURL } = req.body as { reqURL: string };
    const client = new Cloudflare({ apiToken: process.env.CLOUDFLARE_API_TOKEN });
    const directUpload: DirectUploadCreateResponse = await client.stream.directUpload.create({
      account_id: "023e105f4ecef8ad9ca31a8372d0c353",
      maxDurationSeconds: 1,
    });
    const uploadResponse = directUpload;
  } catch {
    console.log("tbd");
  }
});

//Resumable Upload

export default router;
