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
    const required = ["title"];
    for (const key of required) {
        if (body[key] === undefined) {
            res.status(400).json({ error: `Missing field: ${key}` });
            return;
        }
    }
    if (!body.title.trim()) {
        res.status(400).json({ error: "Title cannot be empty" });
        return;
    }
    try {
        const categoryData = {
            title: body.title.trim(),
        };
        const newCategory = yield (0, db_1.createCategory)(categoryData);
        res.status(201).json(newCategory);
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
        const categories = yield (0, db_1.getAllCategories)();
        res.json(categories);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
router.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = String(req.params.id);
    if (!isValidUUID(id)) {
        res.status(400).json({ error: "Invalid category ID format" });
        return;
    }
    try {
        const category = yield (0, db_1.getCategoryById)(id);
        if (!category) {
            res.status(404).json({ error: "Category not found" });
            return;
        }
        res.json(category);
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
        res.status(400).json({ error: "Invalid category ID format" });
        return;
    }
    const allowedFields = ["title"];
    const providedFields = Object.keys(updateData).filter((key) => allowedFields.includes(key));
    if (providedFields.length === 0) {
        res.status(400).json({ error: "Title field must be provided for update" });
        return;
    }
    try {
        const updatedCategory = yield (0, db_1.updateCategory)(id, updateData);
        if (!updatedCategory) {
            res.status(404).json({ error: "Category not found" });
            return;
        }
        res.json(updatedCategory);
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
        res.status(400).json({ error: "Invalid category ID format" });
        return;
    }
    try {
        const deleted = yield (0, db_1.deleteCategory)(id);
        if (!deleted) {
            res.status(404).json({ error: "Category not found" });
            return;
        }
        res.json({ success: true, message: "Category deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
exports.default = router;
