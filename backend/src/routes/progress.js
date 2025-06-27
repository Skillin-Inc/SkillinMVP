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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const router = (0, express_1.Router)();
// Helper function to validate UUID
function isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const required = ["user_id", "lesson_id"];
    for (const key of required) {
        if (body[key] === undefined) {
            res.status(400).json({ error: `Missing field: ${key}` });
            return;
        }
    }
    if (typeof body.user_id !== "string" || !isValidUUID(body.user_id)) {
        res.status(400).json({ error: "user_id must be a valid UUID" });
        return;
    }
    if (typeof body.lesson_id !== "string" || !isValidUUID(body.lesson_id)) {
        res.status(400).json({ error: "lesson_id must be a valid UUID" });
        return;
    }
    try {
        const existingProgress = yield (0, db_1.getProgressByUserAndLesson)(body.user_id, body.lesson_id);
        if (existingProgress) {
            res.status(200).json(existingProgress);
            return;
        }
        const progressData = {
            user_id: body.user_id,
            lesson_id: body.lesson_id,
        };
        const newProgress = yield (0, db_1.createProgress)(progressData);
        res.status(201).json(newProgress);
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
}));
router.get("/user/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = String(req.params.userId);
    if (!isValidUUID(userId)) {
        res.status(400).json({ error: "Invalid user ID format" });
        return;
    }
    try {
        const progressList = yield (0, db_1.getProgressByUser)(userId);
        res.json(progressList);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = String(req.params.id);
    if (!isValidUUID(id)) {
        res.status(400).json({ error: "Invalid progress ID format" });
        return;
    }
    try {
        const progress = yield (0, db_1.getProgressById)(id);
        if (!progress) {
            res.status(404).json({ error: "Progress record not found" });
            return;
        }
        res.json(progress);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = String(req.params.id);
    if (!isValidUUID(id)) {
        res.status(400).json({ error: "Invalid progress ID format" });
        return;
    }
    try {
        const deleted = yield (0, db_1.deleteProgress)(id);
        if (!deleted) {
            res.status(404).json({ error: "Progress record not found" });
            return;
        }
        res.json({ success: true, message: "Progress record deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
router.delete("/user/:userId/lesson/:lessonId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = String(req.params.userId);
    const lessonId = String(req.params.lessonId);
    if (!isValidUUID(userId)) {
        res.status(400).json({ error: "Invalid user ID format" });
        return;
    }
    if (!isValidUUID(lessonId)) {
        res.status(400).json({ error: "Invalid lesson ID format" });
        return;
    }
    try {
        const deleted = yield (0, db_1.deleteProgressByUserAndLesson)(userId, lessonId);
        if (!deleted) {
            res.status(404).json({ error: "Progress record not found" });
            return;
        }
        res.json({ success: true, message: "Progress record deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
exports.default = router;
