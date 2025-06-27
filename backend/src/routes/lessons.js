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
    const required = ["teacher_id", "course_id", "title", "description"];
    for (const key of required) {
        if (body[key] === undefined) {
            res.status(400).json({ error: `Missing field: ${key}` });
            return;
        }
    }
    if (typeof body.teacher_id !== "string" || !isValidUUID(body.teacher_id)) {
        res.status(400).json({ error: "teacher_id must be a valid UUID" });
        return;
    }
    if (typeof body.course_id !== "string" || !isValidUUID(body.course_id)) {
        res.status(400).json({ error: "course_id must be a valid UUID" });
        return;
    }
    if (!body.title.trim() || !body.description.trim()) {
        res.status(400).json({ error: "Title and description cannot be empty" });
        return;
    }
    // video_url is optional for now (will be added via file upload later)
    const video_url = body.video_url || "";
    try {
        const lessonData = {
            teacher_id: body.teacher_id,
            course_id: body.course_id,
            title: body.title.trim(),
            description: body.description.trim(),
            video_url: video_url,
        };
        const newLesson = yield (0, db_1.createLesson)(lessonData);
        res.status(201).json(newLesson);
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
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lessons = yield (0, db_1.getAllLessons)();
        res.json(lessons);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = String(req.params.id);
    if (!isValidUUID(id)) {
        res.status(400).json({ error: "Invalid lesson ID format" });
        return;
    }
    try {
        const lesson = yield (0, db_1.getLessonById)(id);
        if (!lesson) {
            res.status(404).json({ error: "Lesson not found" });
            return;
        }
        res.json(lesson);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
router.get("/teacher/:teacherId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const teacherId = String(req.params.teacherId);
    if (!isValidUUID(teacherId)) {
        res.status(400).json({ error: "Invalid teacher ID format" });
        return;
    }
    try {
        const lessons = yield (0, db_1.getLessonsByTeacher)(teacherId);
        res.json(lessons);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
router.get("/course/:courseId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const courseId = String(req.params.courseId);
    if (!isValidUUID(courseId)) {
        res.status(400).json({ error: "Invalid course ID format" });
        return;
    }
    try {
        const lessons = yield (0, db_1.getLessonsByCourse)(courseId);
        res.json(lessons);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
router.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = String(req.params.id);
    const updateData = req.body;
    if (!isValidUUID(id)) {
        res.status(400).json({ error: "Invalid lesson ID format" });
        return;
    }
    const allowedFields = ["course_id", "title", "description", "video_url"];
    const providedFields = Object.keys(updateData).filter((key) => allowedFields.includes(key));
    if (providedFields.length === 0) {
        res
            .status(400)
            .json({ error: "At least one field (course_id, title, description, video_url) must be provided for update" });
        return;
    }
    // Validate course_id if provided
    if (updateData.course_id && (!isValidUUID(updateData.course_id) || typeof updateData.course_id !== "string")) {
        res.status(400).json({ error: "course_id must be a valid UUID" });
        return;
    }
    try {
        const updatedLesson = yield (0, db_1.updateLesson)(id, updateData);
        if (!updatedLesson) {
            res.status(404).json({ error: "Lesson not found" });
            return;
        }
        res.json(updatedLesson);
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
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = String(req.params.id);
    if (!isValidUUID(id)) {
        res.status(400).json({ error: "Invalid lesson ID format" });
        return;
    }
    try {
        const deleted = yield (0, db_1.deleteLesson)(id);
        if (!deleted) {
            res.status(404).json({ error: "Lesson not found" });
            return;
        }
        res.json({ success: true, message: "Lesson deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
exports.default = router;
