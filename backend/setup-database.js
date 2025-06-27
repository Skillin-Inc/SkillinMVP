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
const pg_1 = require("pg");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
require("dotenv/config");
function setupDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        const pool = new pg_1.Pool({
            host: process.env.PG_HOST || "localhost",
            port: Number(process.env.PG_PORT) || 5432,
            user: process.env.PG_USER,
            password: process.env.PG_PASSWORD,
            database: process.env.PG_DATABASE,
        });
        try {
            console.log("Connecting to db...");
            yield pool.query("SELECT NOW()");
            console.log("Successfully connected to db");
            const schemaPath = path_1.default.join(__dirname, "database", "schema.sql");
            const schema = fs_1.default.readFileSync(schemaPath, "utf8");
            console.log("Setting up db schema...");
            yield pool.query(schema);
            console.log("Successfully set up db schema");
            const dataPath = path_1.default.join(__dirname, "database", "data.sql");
            const data = fs_1.default.readFileSync(dataPath, "utf8");
            console.log("Inserting sample data...");
            yield pool.query(data);
            console.log("Successfully inserted sample data");
            console.log("Db setup complete");
        }
        catch (error) {
            console.error("Db setup failed:");
            console.error(error);
            console.error("Please check your db connection and try again.");
        }
        finally {
            yield pool.end();
        }
    });
}
setupDatabase();
