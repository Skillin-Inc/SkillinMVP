// src/routes/users.ts
import { Router, Request, Response } from "express";
import { createUser, NewUser, getUserById, getUserByAccount, getUserByPhone, getUserByEmail } from "../db";

const router = Router();

// GET /users/:id
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const user = await getUserById(id);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(user);
  return;
});

// GET /users/:account_name
router.get("/by-account/:account", async (req, res) => {
  const account = String(req.params.account);
  const user = await getUserByAccount(account);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(user);
  return;
});

// GET /users/:phone_name
router.get("/by-phone/:phone", async (req, res) => {
  const phone_number = String(req.params.phone);
  const user = await getUserByPhone(phone_number);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(user);
  return;
});

// GET /users/:email
router.get("/by-email/:email", async (req, res) => {
  const email = String(req.params.email);
  const user = await getUserByEmail(email);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(user);
  return;
});

router.post(
  "/",
  // 1st generic: params (none → object)
  // 2nd generic: response body (unknown)
  // 3rd generic: request body (NewUser)
  async (req: Request<object, unknown, NewUser>, res: Response): Promise<void> => {
    const body = req.body;

    const required: (keyof NewUser)[] = [
      "firstname",
      "lastname",
      "email",
      "phone_number",
      "account_name",
      "password",
      "postal_code",
    ];

    for (const key of required) {
      if (body[key] === undefined) {
        res.status(400).json({ error: `Missing field: ${key}` });
        return;
      }
    }

    try {
      const newUser = await createUser(body);
      res.status(201).json(newUser);
    } catch (err: unknown) {
      console.error(err);
      res.status(500).json({ error: err instanceof Error ? err.message : "Unknown error" });
    }
    return;
  }
);

export default router;
