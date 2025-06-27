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
// test-post-user.js
// this file is only for testing the create function
const node_fetch_1 = __importDefault(require("node-fetch"));
function testCreateUser() {
    return __awaiter(this, void 0, void 0, function* () {
        const url = "http://localhost:4000/users";
        const payload = {
            firstname: "hahabo",
            lastname: "Cool",
            email: "jon3.doe@example.com",
            phone_number: "1290",
            account_name: "jondoe",
            password: "s3cre11t",
            postal_code: "80309",
        };
        try {
            // send request
            const response = yield (0, node_fetch_1.default)(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            console.log("Status:", response.status, response.statusText);
            console.log("Headers:", Object.fromEntries(response.headers.entries()));
            const body = yield response.json();
            console.log("Response body:", body);
            if (response.ok) {
                console.log("✅ successful new user ID =", body.id);
            }
            else {
                console.error("❌ failed error msg =", body.error || body);
            }
        }
        catch (err) {
            console.error("🔥 abnormal", err);
        }
    });
}
testCreateUser();
