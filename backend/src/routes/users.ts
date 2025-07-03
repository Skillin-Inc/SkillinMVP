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
  getAllUsers,
  deleteUserByEmail,
  updateUserTypeByEmail,
  updateUserProfile,
  UpdateUserProfileData,
  checkUsernameAvailability,
} from "../db";
import rateLimit from "express-rate-limit";

const router = Router();

function isValidCognitoSub(sub: string): boolean {
  // Cognito userSub format: region_userpoolid_username or similar
  return typeof sub === "string" && sub.length > 0;
}

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

router.get("/:id", async (req, res) => {
  const id = String(req.params.id);

  if (!isValidCognitoSub(id)) {
    res.status(400).json({ error: "Invalid user ID format" });
    return;
  }

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

  const required: (keyof NewUser)[] = ["firstName", "lastName", "email", "username", "password"];

  for (const key of required) {
    if (body[key] === undefined) {
      res.status(400).json({ error: `Missing field: ${key}` });
      return;
    }
  }

  // Validate that id is provided (Cognito userSub)
  if (!body.id) {
    res.status(400).json({ error: "Missing field: id (Cognito userSub)" });
    return;
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

const updateProfileHandler: RequestHandler<{ id: string }, unknown, UpdateUserProfileData> = async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!isValidCognitoSub(id)) {
    res.status(400).json({ error: "Invalid user ID format" });
    return;
  }

  if (
    !updateData.firstName &&
    !updateData.lastName &&
    !updateData.phoneNumber &&
    !updateData.dateOfBirth &&
    !updateData.username
  ) {
    res.status(400).json({ error: "At least one field must be provided for update" });
    return;
  }

  if (updateData.username) {
    const isAvailable = await checkUsernameAvailability(updateData.username, id);
    if (!isAvailable) {
      res.status(400).json({ error: "Username is already taken" });
      return;
    }
  }

  try {
    const updated = await updateUserProfile(id, updateData);

    if (updated) {
      res.status(200).json({ message: "Profile updated successfully", user: updated });
    } else {
      res.status(404).json({ message: "User not found" });
    }
    return;
  } catch (err) {
    next(err);
  }
};

router.patch("/:id/profile", updateProfileHandler);

const checkUsernameHandler: RequestHandler<{ username: string }, unknown, { excludeUserId?: string }> = async (
  req,
  res,
  next
) => {
  const { username } = req.params;
  const { excludeUserId } = req.body;

  if (!username) {
    res.status(400).json({ error: "Username is required" });
    return;
  }

  try {
    const isAvailable = await checkUsernameAvailability(username, excludeUserId);
    res.status(200).json({ available: isAvailable });
    return;
  } catch (err) {
    next(err);
  }
};

router.post("/check-username/:username", checkUsernameHandler);

export default router;
