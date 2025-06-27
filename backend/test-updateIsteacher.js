"use strict";
// test-updateIsteacher.ts
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
const axios_1 = __importDefault(require("axios"));
function toggleIsTeacher() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const email = "student@email.com";
        const encodedEmail = encodeURIComponent(email);
        const url = `http://localhost:4000/users/${encodedEmail}`;
        try {
            const res = yield axios_1.default.patch(url);
            console.log(`Status: ${res.status}`);
            console.log("Body:", res.data);
        }
        catch (err) {
            if (axios_1.default.isAxiosError(err)) {
                console.error(`Error Status: ${(_a = err.response) === null || _a === void 0 ? void 0 : _a.status}`);
                console.error("Error Body:", (_b = err.response) === null || _b === void 0 ? void 0 : _b.data);
            }
            else {
                console.error("Request Error:", err instanceof Error ? err.message : String(err));
            }
        }
    });
}
toggleIsTeacher();
