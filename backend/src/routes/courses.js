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
    const required = ["teacher_id", "category_id", "title", "description"];
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
    if (typeof body.category_id !== "string" || !isValidUUID(body.category_id)) {
        res.status(400).json({ error: "category_id must be a valid UUID" });
        return;
    }
    if (!body.title.trim() || !body.description.trim()) {
        res.status(400).json({ error: "Title and description cannot be empty" });
        return;
    }
    try {
        const courseData = {
            teacher_id: body.teacher_id,
            category_id: body.category_id,
            title: body.title.trim(),
            description: body.description.trim(),
        };
        const newCourse = yield (0, db_1.createCourse)(courseData);
        res.status(201).json(newCourse);
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
        const courses = yield (0, db_1.getAllCourses)();
        res.json(courses);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = String(req.params.id);
    if (!isValidUUID(id)) {
        res.status(400).json({ error: "Invalid course ID format" });
        return;
    }
    try {
        const course = yield (0, db_1.getCourseById)(id);
        if (!course) {
            res.status(404).json({ error: "Course not found" });
            return;
        }
        res.json(course);
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
        const courses = yield (0, db_1.getCoursesByTeacher)(teacherId);
        res.json(courses);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
router.get("/category/:categoryId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const categoryId = String(req.params.categoryId);
    if (!isValidUUID(categoryId)) {
        res.status(400).json({ error: "Invalid category ID format" });
        return;
    }
    try {
        const courses = yield (0, db_1.getCoursesByCategory)(categoryId);
        res.json(courses);
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
        res.status(400).json({ error: "Invalid course ID format" });
        return;
    }
    const allowedFields = ["category_id", "title", "description"];
    const providedFields = Object.keys(updateData).filter((key) => allowedFields.includes(key));
    if (providedFields.length === 0) {
        res.status(400).json({ error: "At least one field (category_id, title, description) must be provided for update" });
        return;
    }
    // Validate category_id if provided
    if (updateData.category_id && (!isValidUUID(updateData.category_id) || typeof updateData.category_id !== "string")) {
        res.status(400).json({ error: "category_id must be a valid UUID" });
        return;
    }
    try {
        const updatedCourse = yield (0, db_1.updateCourse)(id, updateData);
        if (!updatedCourse) {
            res.status(404).json({ error: "Course not found" });
            return;
        }
        res.json(updatedCourse);
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
        res.status(400).json({ error: "Invalid course ID format" });
        return;
    }
    try {
        const deleted = yield (0, db_1.deleteCourse)(id);
        if (!deleted) {
            res.status(404).json({ error: "Course not found" });
            return;
        }
        res.json({ success: true, message: "Course deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
exports.default = router;
