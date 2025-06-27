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
// src/routes/messages.ts
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
    const required = ["sender_id", "receiver_id", "content"];
    for (const key of required) {
        if (body[key] === undefined) {
            res.status(400).json({ error: `Missing field: ${key}` });
            return;
        }
    }
    if (typeof body.sender_id !== "string" || !isValidUUID(body.sender_id)) {
        res.status(400).json({ error: "sender_id must be a valid UUID" });
        return;
    }
    if (typeof body.receiver_id !== "string" || !isValidUUID(body.receiver_id)) {
        res.status(400).json({ error: "receiver_id must be a valid UUID" });
        return;
    }
    if (!body.content.trim()) {
        res.status(400).json({ error: "Message content cannot be empty" });
        return;
    }
    try {
        const newMessage = yield (0, db_1.createMessage)(body);
        res.status(201).json(newMessage);
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
router.get("/between/:userId1/:userId2", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId1 = String(req.params.userId1);
    const userId2 = String(req.params.userId2);
    if (!isValidUUID(userId1) || !isValidUUID(userId2)) {
        res.status(400).json({ error: "Invalid user ID format" });
        return;
    }
    try {
        const messages = yield (0, db_1.getMessagesBetweenUsers)(userId1, userId2);
        res.json(messages);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
    return;
}));
router.get("/conversations/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = String(req.params.userId);
    if (!isValidUUID(userId)) {
        res.status(400).json({ error: "Invalid user ID format" });
        return;
    }
    try {
        const conversations = yield (0, db_1.getConversationsForUser)(userId);
        res.json(conversations);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
    return;
}));
router.put("/mark-read/:userId/:otherUserId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = String(req.params.userId);
    const otherUserId = String(req.params.otherUserId);
    if (!isValidUUID(userId) || !isValidUUID(otherUserId)) {
        res.status(400).json({ error: "Invalid user ID format" });
        return;
    }
    try {
        const markedMessages = yield (0, db_1.markMessagesAsRead)(userId, otherUserId);
        res.json({ message: "Messages marked as read", count: markedMessages.length });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
    return;
}));
exports.default = router;
