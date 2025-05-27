// src/routes/users.ts
import { Router, Request, Response, NextFunction, RequestHandler } from "express";
import {
  createUser,
  NewUser,
  getUserById,
  getUserByUsername,
  getUserByPhone,
  getUserByEmail,
  verifyUser,
  deleteUserByEmail,
} from "../db";

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

// GET /users/by-username/:username
router.get("/by-username/:username", async (req, res) => {
  const username = String(req.params.username);
  const user = await getUserByUsername(username);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(user);
  return;
});

// GET /users/by-phone/:phone
router.get("/by-phone/:phone", async (req, res) => {
  const phoneNumber = String(req.params.phone);
  const user = await getUserByPhone(phoneNumber);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(user);
  return;
});

// GET /users/by-email/:email
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

// POST /users/login
router.post(
  "/login",
  async (req: Request<object, unknown, { emailOrPhone: string; password: string }>, res: Response): Promise<void> => {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      res.status(400).json({ error: "Email/phone and password are required" });
      return;
    }

    try {
      const user = await verifyUser(emailOrPhone, password);
      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      res.json({ success: true, user });
    } catch (error: unknown) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// POST /users (register)
router.post("/", async (req: Request<object, unknown, NewUser>, res: Response): Promise<void> => {
  const body = req.body;

  const required: (keyof NewUser)[] = [
    "firstName",
    "lastName",
    "email",
    "phoneNumber",
    "username",
    "password",
    "postalCode",
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
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Unknown error occurred" });
    }
  }
  return;
});
// Delete by Email
const deleteByEmailHandler: RequestHandler<{ email: string }> = async (req, res, next) => {
  const { email } = req.params;

  try {
    const deleted = await deleteUserByEmail(email);

    if (deleted) {
      res.status(200).json({ message: "User deleted", user: deleted });
    } else {
      res.status(404).json({ message: "No user found" });
    }
    return;
  } catch (err) {
    next(err);
  }
};

router.delete("/:email", deleteByEmailHandler);
export default router;
