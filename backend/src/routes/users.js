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
// src/routes/users.ts
const express_1 = require("express");
const db_1 = require("../db");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = (0, express_1.Router)();
// Helper function to validate UUID
function isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield (0, db_1.getAllUsers)();
        res.json(users);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
    return;
}));
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = String(req.params.id);
    if (!isValidUUID(id)) {
        res.status(400).json({ error: "Invalid user ID format" });
        return;
    }
    const user = yield (0, db_1.getUserById)(id);
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }
    res.json(user);
    return;
}));
router.get("/by-username/:username", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = String(req.params.username);
    const user = yield (0, db_1.getUserByUsername)(username);
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }
    res.json(user);
    return;
}));
router.get("/by-phone/:phone", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const phoneNumber = String(req.params.phone);
    const user = yield (0, db_1.getUserByPhone)(phoneNumber);
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }
    res.json(user);
    return;
}));
router.get("/by-email/:email", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = String(req.params.email);
    const user = yield (0, db_1.getUserByEmail)(email);
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }
    res.json(user);
    return;
}));
const loginRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many login attempts from this IP, please try again later.",
});
router.post("/login", loginRateLimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) {
        res.status(400).json({ error: "Email/phone and password are required" });
        return;
    }
    try {
        const user = yield (0, db_1.verifyUser)(emailOrPhone, password);
        if (!user) {
            res.status(401).json({ error: "Invalid credentials" });
            return;
        }
        res.json({ success: true, user });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const required = [
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
        const newUser = yield (0, db_1.createUser)(body);
        res.status(201).json(newUser);
    }
    catch (error) {
        console.error(error);
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "Unknown error occurred" });
        }
    }
    return;
}));
const deleteByEmailHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.params;
    try {
        const deleted = yield (0, db_1.deleteUserByEmail)(email);
        if (deleted) {
            res.status(200).json({ message: "User deleted", user: deleted });
        }
        else {
            res.status(404).json({ message: "No user found" });
        }
        return;
    }
    catch (err) {
        next(err);
    }
});
router.delete("/:email", deleteByEmailHandler);
const updateUserTypeHandler = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.params;
    const { userType } = req.body;
    if (!userType || !["student", "teacher", "admin"].includes(userType)) {
        res.status(400).json({ error: "Invalid user type. Must be 'student', 'teacher', or 'admin'" });
        return;
    }
    try {
        const updated = yield (0, db_1.updateUserTypeByEmail)(email, userType);
        if (updated) {
            res.status(200).json({ message: "User type updated", user: updated });
        }
        else {
            res.status(404).json({ message: "No user found or no change made" });
        }
        return;
    }
    catch (err) {
        next(err);
    }
});
router.patch("/:email/user-type", updateUserTypeHandler);
exports.default = router;
