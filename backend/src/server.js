"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
// src/server.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const users_1 = __importDefault(require("./routes/users"));
const sendEmail_1 = __importDefault(require("./routes/sendEmail"));
const messages_1 = __importDefault(require("./routes/messages"));
const lessons_1 = __importDefault(require("./routes/lessons"));
const courses_1 = __importDefault(require("./routes/courses"));
const categories_1 = __importDefault(require("./routes/categories"));
const progress_1 = __importDefault(require("./routes/progress"));
const teachers_1 = __importDefault(require("./routes/teachers"));
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*", // change to frontend url in prod
        methods: ["GET", "POST"],
    },
});
const PORT = Number(process.env.PORT) || 4000;
const userSockets = new Map();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "10mb" })); // change to 20mb if needed
// backend check
app.get("/", (req, res) => {
    res.send("Hello from Express + TypeScript!");
});
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    socket.on("register", (userId) => {
        userSockets.set(userId, socket.id);
        console.log(`User ${userId} registered with socket ${socket.id}`);
    });
    socket.on("send_message", (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { createMessage } = yield Promise.resolve().then(() => __importStar(require("./db")));
            const newMessage = yield createMessage({
                sender_id: data.sender_id,
                receiver_id: data.receiver_id,
                content: data.content,
            });
            const receiverSocketId = userSockets.get(data.receiver_id);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("new_message", {
                    id: newMessage.id,
                    sender_id: newMessage.sender_id,
                    receiver_id: newMessage.receiver_id,
                    content: newMessage.content,
                    is_read: newMessage.is_read,
                    created_at: newMessage.created_at,
                });
            }
            socket.emit("message_sent", {
                id: newMessage.id,
                sender_id: newMessage.sender_id,
                receiver_id: newMessage.receiver_id,
                content: newMessage.content,
                is_read: newMessage.is_read,
                created_at: newMessage.created_at,
            });
        }
        catch (error) {
            console.error("Error handling message:", error);
            socket.emit("message_error", { error: "Failed to send message" });
        }
    }));
    socket.on("disconnect", () => {
        for (const [userId, socketId] of userSockets.entries()) {
            if (socketId === socket.id) {
                userSockets.delete(userId);
                console.log(`User ${userId} disconnected`);
                break;
            }
        }
    });
});
app.use("/users", users_1.default);
app.use("/send-email", sendEmail_1.default);
app.use("/messages", messages_1.default);
app.use("/lessons", lessons_1.default);
app.use("/courses", courses_1.default);
app.use("/categories", categories_1.default);
app.use("/progress", progress_1.default);
app.use("/teachers", teachers_1.default);
app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
});
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
