// src/routes/users.ts
import { Router, Request, Response, RequestHandler } from "express";
import {
  createUser,
  NewUser,
  getUserById,
  getUserByUsername,
  getUserByPhone,
  getUserByEmail,
  verifyUser,
  getIsPaidByUserId ,
  getAllUsers,
  deleteUserByEmail,
  updateUserTypeByEmail,
} from "../db";
import rateLimit from "express-rate-limit";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error: unknown) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
  return;
});

router.get("/check-paid-status", async (req, res) => {
  const rawId = req.query.userId;
  console.log("Raw userId:", rawId); 

  const userId = parseInt(rawId as string, 10);
  if (isNaN(userId)) {
    res.status(400).json({ error: "Invalid userId" });
    return;
  }

  try {
    const isPaid = await getIsPaidByUserId(userId);

    if (isPaid === null) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ isPaid });
  } catch (err) {
    console.error("Error checking paid status:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

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


const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts from this IP, please try again later.",
});

router.post(
  "/login",
  loginRateLimiter,
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

const updateUserTypeHandler: RequestHandler<
  { email: string },
  unknown,
  { userType: "student" | "teacher" | "admin" }
> = async (req, res, next) => {
  const { email } = req.params;
  const { userType } = req.body;

  if (!userType || !["student", "teacher", "admin"].includes(userType)) {
    res.status(400).json({ error: "Invalid user type. Must be 'student', 'teacher', or 'admin'" });
    return;
  }

  try {
    const updated = await updateUserTypeByEmail(email, userType);

    if (updated) {
      res.status(200).json({ message: "User type updated", user: updated });
    } else {
      res.status(404).json({ message: "No user found or no change made" });
    }
    return;
  } catch (err) {
    next(err);
  }
};

router.patch("/:email/user-type", updateUserTypeHandler);

export default router;
