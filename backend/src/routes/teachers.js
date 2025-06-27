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
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const db_1 = require("../db");
const router = (0, express_1.Router)();
// Helper function to validate UUID
function isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}
const readRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 read requests per windowMs
    message: "Too many read requests from this IP, please try again later.",
});
const writeRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 write requests per windowMs
    message: "Too many write requests from this IP, please try again later.",
});
const deleteRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 delete requests per hour
    message: "Too many delete requests from this IP, please try again later.",
});
// GET /teachers — list all teachers
router.get("/", readRateLimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.pool.query(`
  SELECT 
    t.*, 
    u.first_name, 
    u.last_name, 
    u.email, 
    u.username,
    u.phone_number,
    c.title AS category_title
  FROM public.teachers t
  JOIN public.users u ON t.user_id = u.id
  JOIN public.categories c ON t.category_id = c.id
`);
        res.json(result.rows);
    }
    catch (_a) {
        console.error("Failed to fetch teachers");
        res.status(500).json({ error: "Failed to fetch teachers" });
    }
}));
// GET /teachers/:id - Single teacher object
router.get("/:id", readRateLimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = String(req.params.id);
    if (!isValidUUID(id)) {
        res.status(400).json({ error: "Invalid teacher ID format" });
        return;
    }
    try {
        const result = yield db_1.pool.query(`SELECT t.*, u.first_name, u.last_name, u.username, u.email, c.title AS category_title

       FROM public.teachers t
       JOIN public.users u ON t.user_id = u.id
       JOIN public.categories c ON t.category_id = c.id
       WHERE t.id = $1`, [id]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: "Teacher not found" });
            return;
        }
        res.json(result.rows[0]);
    }
    catch (_a) {
        res.status(500).json({ error: "Failed to fetch teacher" });
    }
}));
// PATCH /teachers/:id — update category
router.patch("/:id", writeRateLimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = String(req.params.id);
    const { category_id } = req.body;
    if (!isValidUUID(id)) {
        res.status(400).json({ error: "Invalid teacher ID format" });
        return;
    }
    if (category_id && (!isValidUUID(category_id) || typeof category_id !== "string")) {
        res.status(400).json({ error: "category_id must be a valid UUID" });
        return;
    }
    try {
        const result = yield db_1.pool.query(`UPDATE public.teachers
       SET category_id = $1
       WHERE id = $2
       RETURNING *`, [category_id, id]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: "Teacher not found" });
            return;
        }
        res.json(result.rows[0]);
    }
    catch (_a) {
        res.status(500).json({ error: "Failed to update teacher" });
    }
}));
// DELETE /teachers/:id
router.delete("/:id", deleteRateLimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = String(req.params.id);
    if (!isValidUUID(id)) {
        res.status(400).json({ error: "Invalid teacher ID format" });
        return;
    }
    try {
        const result = yield db_1.pool.query(`DELETE FROM public.teachers WHERE id = $1 RETURNING *`, [id]);
        if (result.rowCount === 0) {
            res.status(404).json({ error: "Teacher not found" });
            return;
        }
        res.json({ message: "Teacher deleted", teacher: result.rows[0] });
    }
    catch (_a) {
        res.status(500).json({ error: "Failed to delete teacher" });
    }
}));
exports.default = router;
