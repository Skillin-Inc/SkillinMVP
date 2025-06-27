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
exports.pool = void 0;
exports.getUserById = getUserById;
exports.getUserByUsername = getUserByUsername;
exports.getUserByPhone = getUserByPhone;
exports.getUserByEmail = getUserByEmail;
exports.getAllUsers = getAllUsers;
exports.createUser = createUser;
exports.verifyUser = verifyUser;
exports.createMessage = createMessage;
exports.createCategory = createCategory;
exports.getAllCategories = getAllCategories;
exports.getCategoryById = getCategoryById;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
exports.createCourse = createCourse;
exports.getAllCourses = getAllCourses;
exports.getCourseById = getCourseById;
exports.getCoursesByTeacher = getCoursesByTeacher;
exports.getCoursesByCategory = getCoursesByCategory;
exports.updateCourse = updateCourse;
exports.deleteCourse = deleteCourse;
exports.createLesson = createLesson;
exports.getAllLessons = getAllLessons;
exports.getLessonById = getLessonById;
exports.getLessonsByTeacher = getLessonsByTeacher;
exports.getLessonsByCourse = getLessonsByCourse;
exports.updateLesson = updateLesson;
exports.deleteLesson = deleteLesson;
exports.getMessagesBetweenUsers = getMessagesBetweenUsers;
exports.getConversationsForUser = getConversationsForUser;
exports.markMessagesAsRead = markMessagesAsRead;
exports.getUnreadCount = getUnreadCount;
exports.deleteUserByEmail = deleteUserByEmail;
exports.updateUserTypeByEmail = updateUserTypeByEmail;
exports.createProgress = createProgress;
exports.getProgressByUser = getProgressByUser;
exports.getProgressById = getProgressById;
exports.getProgressByUserAndLesson = getProgressByUserAndLesson;
exports.deleteProgress = deleteProgress;
exports.deleteProgressByUserAndLesson = deleteProgressByUserAndLesson;
// src/db.ts
const pg_1 = require("pg");
require("dotenv/config");
exports.pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
function getUserById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const result = yield exports.pool.query('SELECT * FROM public.users WHERE "id" = $1', [id]);
        return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
    });
}
function getUserByUsername(username) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const result = yield exports.pool.query("SELECT * FROM public.users WHERE username = $1", [username]);
        return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
    });
}
function getUserByPhone(phoneNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const result = yield exports.pool.query('SELECT * FROM public.users WHERE "phone_number" = $1', [phoneNumber]);
        return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
    });
}
function getUserByEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const result = yield exports.pool.query("SELECT * FROM public.users WHERE email = $1", [email]);
        return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
    });
}
function getAllUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield exports.pool.query('SELECT "id", "first_name", "last_name", email, "phone_number", username, "postal_code", "created_at" FROM public.users ORDER BY "created_at" DESC');
        return result.rows;
    });
}
function createUser(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const { firstName, lastName, email, phoneNumber, username, password, postalCode, userType = "student" } = data;
        const result = yield exports.pool.query(`INSERT INTO public.users
    ("first_name", "last_name", email, "phone_number", username, "hashed_password", "postal_code", "user_type")
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
   RETURNING "id", "first_name", "last_name", email, "phone_number", username, "postal_code", "user_type", "created_at"`, [firstName, lastName, email, phoneNumber, username, password, postalCode, userType]);
        return result.rows[0];
    });
}
function verifyUser(emailOrPhone, password) {
    return __awaiter(this, void 0, void 0, function* () {
        let user;
        if (emailOrPhone.includes("@")) {
            user = yield getUserByEmail(emailOrPhone);
        }
        else {
            user = yield getUserByPhone(emailOrPhone);
        }
        if (!user) {
            return null;
        }
        if (user.hashed_password !== password) {
            return null;
        }
        delete user.hashed_password;
        return user;
    });
}
function createMessage(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const { sender_id, receiver_id, content } = data;
        const result = yield exports.pool.query(`INSERT INTO public.messages
      ("sender_id", "receiver_id", "content")
     VALUES ($1, $2, $3)
     RETURNING "id", "sender_id", "receiver_id", "content", "is_read", "created_at"`, [sender_id, receiver_id, content]);
        return result.rows[0];
    });
}
function createCategory(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const { title } = data;
        const result = yield exports.pool.query(`INSERT INTO public.categories
      ("title")
     VALUES ($1)
     RETURNING "id", "title"`, [title]);
        return result.rows[0];
    });
}
function getAllCategories() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield exports.pool.query(`SELECT * FROM public.categories ORDER BY title ASC`);
        return result.rows;
    });
}
function getCategoryById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield exports.pool.query(`SELECT * FROM public.categories WHERE "id" = $1`, [id]);
        return result.rows[0] || null;
    });
}
function updateCategory(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const fields = [];
        const values = [];
        let paramCount = 1;
        if (data.title !== undefined) {
            fields.push(`"title" = $${paramCount}`);
            values.push(data.title);
            paramCount++;
        }
        if (fields.length === 0) {
            throw new Error("No fields to update");
        }
        values.push(id);
        const result = yield exports.pool.query(`UPDATE public.categories 
     SET ${fields.join(", ")}
     WHERE "id" = $${paramCount}
     RETURNING "id", "title"`, values);
        return result.rows[0] || null;
    });
}
function deleteCategory(id) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const result = yield exports.pool.query(`DELETE FROM public.categories WHERE "id" = $1`, [id]);
        return ((_a = result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
    });
}
function createCourse(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const { teacher_id, category_id, title, description } = data;
        const result = yield exports.pool.query(`INSERT INTO public.courses
      ("teacher_id", "category_id", "title", "description")
     VALUES ($1, $2, $3, $4)
     RETURNING "id", "teacher_id", "category_id", "title", "description", "created_at"`, [teacher_id, category_id, title, description]);
        return result.rows[0];
    });
}
function getAllCourses() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield exports.pool.query(`SELECT c.*, u."first_name" as teacher_first_name, u."last_name" as teacher_last_name, u."username" as teacher_username
     FROM public.courses c
     JOIN public.users u ON c.teacher_id = u."id"
     ORDER BY c.created_at DESC`);
        return result.rows;
    });
}
function getCourseById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield exports.pool.query(`SELECT c.*, u."first_name" as teacher_first_name, u."last_name" as teacher_last_name, u."username" as teacher_username
     FROM public.courses c
     JOIN public.users u ON c.teacher_id = u."id"
     WHERE c."id" = $1`, [id]);
        return result.rows[0] || null;
    });
}
function getCoursesByTeacher(teacherId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield exports.pool.query(`SELECT c.*, u."first_name" as teacher_first_name, u."last_name" as teacher_last_name, u."username" as teacher_username
     FROM public.courses c
     JOIN public.users u ON c.teacher_id = u."id"
     WHERE c.teacher_id = $1
     ORDER BY c.created_at DESC`, [teacherId]);
        return result.rows;
    });
}
function getCoursesByCategory(categoryId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield exports.pool.query(`SELECT c.*, u."first_name" as teacher_first_name, u."last_name" as teacher_last_name, u."username" as teacher_username
     FROM public.courses c
     JOIN public.users u ON c.teacher_id = u."id"
     WHERE c.category_id = $1
     ORDER BY c.created_at DESC`, [categoryId]);
        return result.rows;
    });
}
function updateCourse(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const fields = [];
        const values = [];
        let paramCount = 1;
        if (data.category_id !== undefined) {
            fields.push(`"category_id" = $${paramCount}`);
            values.push(data.category_id);
            paramCount++;
        }
        if (data.title !== undefined) {
            fields.push(`"title" = $${paramCount}`);
            values.push(data.title);
            paramCount++;
        }
        if (data.description !== undefined) {
            fields.push(`"description" = $${paramCount}`);
            values.push(data.description);
            paramCount++;
        }
        if (fields.length === 0) {
            throw new Error("No fields to update");
        }
        values.push(id);
        const result = yield exports.pool.query(`UPDATE public.courses 
     SET ${fields.join(", ")}
     WHERE "id" = $${paramCount}
     RETURNING "id", "teacher_id", "category_id", "title", "description", "created_at"`, values);
        return result.rows[0] || null;
    });
}
function deleteCourse(id) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const result = yield exports.pool.query(`DELETE FROM public.courses WHERE "id" = $1`, [id]);
        return ((_a = result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
    });
}
function createLesson(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const { teacher_id, course_id, title, description, video_url } = data;
        const result = yield exports.pool.query(`INSERT INTO public.lessons
      ("teacher_id", "course_id", "title", "description", "video_url")
     VALUES ($1, $2, $3, $4, $5)
     RETURNING "id", "teacher_id", "course_id", "title", "description", "video_url", "created_at"`, [teacher_id, course_id, title, description, video_url]);
        return result.rows[0];
    });
}
function getAllLessons() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield exports.pool.query(`SELECT l.*, u."first_name" as teacher_first_name, u."last_name" as teacher_last_name
     FROM public.lessons l
     JOIN public.users u ON l.teacher_id = u."id"
     ORDER BY l.created_at DESC`);
        return result.rows;
    });
}
function getLessonById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield exports.pool.query(`SELECT l.*, u."first_name" as teacher_first_name, u."last_name" as teacher_last_name
     FROM public.lessons l
     JOIN public.users u ON l.teacher_id = u."id"
     WHERE l."id" = $1`, [id]);
        return result.rows[0] || null;
    });
}
function getLessonsByTeacher(teacherId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield exports.pool.query(`SELECT l.*, u."first_name" as teacher_first_name, u."last_name" as teacher_last_name
     FROM public.lessons l
     JOIN public.users u ON l.teacher_id = u."id"
     WHERE l.teacher_id = $1
     ORDER BY l.created_at DESC`, [teacherId]);
        return result.rows;
    });
}
function getLessonsByCourse(courseId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield exports.pool.query(`SELECT l.*, u."first_name" as teacher_first_name, u."last_name" as teacher_last_name
     FROM public.lessons l
     JOIN public.users u ON l.teacher_id = u."id"
     WHERE l.course_id = $1
     ORDER BY l.created_at DESC`, [courseId]);
        return result.rows;
    });
}
function updateLesson(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const fields = [];
        const values = [];
        let paramCount = 1;
        if (data.course_id !== undefined) {
            fields.push(`"course_id" = $${paramCount}`);
            values.push(data.course_id);
            paramCount++;
        }
        if (data.title !== undefined) {
            fields.push(`"title" = $${paramCount}`);
            values.push(data.title);
            paramCount++;
        }
        if (data.description !== undefined) {
            fields.push(`"description" = $${paramCount}`);
            values.push(data.description);
            paramCount++;
        }
        if (data.video_url !== undefined) {
            fields.push(`"video_url" = $${paramCount}`);
            values.push(data.video_url);
            paramCount++;
        }
        if (fields.length === 0) {
            throw new Error("No fields to update");
        }
        values.push(id);
        const result = yield exports.pool.query(`UPDATE public.lessons 
     SET ${fields.join(", ")}
     WHERE "id" = $${paramCount}
     RETURNING "id", "teacher_id", "course_id", "title", "description", "video_url", "created_at"`, values);
        return result.rows[0] || null;
    });
}
function deleteLesson(id) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const result = yield exports.pool.query(`DELETE FROM public.lessons WHERE "id" = $1`, [id]);
        return ((_a = result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
    });
}
function getMessagesBetweenUsers(userId1, userId2) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield exports.pool.query(`SELECT m.id, m.sender_id, m.receiver_id, m.content, m.is_read, m.created_at,
            u1."first_name" as sender_first_name, u1."last_name" as sender_last_name,
            u2."first_name" as receiver_first_name, u2."last_name" as receiver_last_name
     FROM public.messages m
     JOIN public.users u1 ON m.sender_id = u1."id"
     JOIN public.users u2 ON m.receiver_id = u2."id"
     WHERE (m.sender_id = $1 AND m.receiver_id = $2) 
        OR (m.sender_id = $2 AND m.receiver_id = $1)
     ORDER BY m.created_at ASC`, [userId1, userId2]);
        return result.rows;
    });
}
function getConversationsForUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield exports.pool.query(`SELECT DISTINCT 
            CASE 
                WHEN m.sender_id = $1 THEN m.receiver_id 
                ELSE m.sender_id 
            END as other_user_id,
            CASE 
                WHEN m.sender_id = $1 THEN u2."first_name" 
                ELSE u1."first_name" 
            END as other_user_first_name,
            CASE 
                WHEN m.sender_id = $1 THEN u2."last_name" 
                ELSE u1."last_name" 
            END as other_user_last_name,
            m.content as last_message,
            m.created_at as last_message_time,
            (SELECT COUNT(*) 
             FROM public.messages unread 
             WHERE unread.receiver_id = $1 
               AND unread.sender_id = CASE 
                   WHEN m.sender_id = $1 THEN m.receiver_id 
                   ELSE m.sender_id 
               END
               AND unread.is_read = false) as unread_count
     FROM public.messages m
     JOIN public.users u1 ON m.sender_id = u1."id"
     JOIN public.users u2 ON m.receiver_id = u2."id"
     WHERE m.sender_id = $1 OR m.receiver_id = $1
     ORDER BY m.created_at DESC`, [userId]);
        return result.rows;
    });
}
function markMessagesAsRead(userId, otherUserId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield exports.pool.query(`UPDATE public.messages 
     SET "is_read" = true 
     WHERE "receiver_id" = $1 AND "sender_id" = $2 AND "is_read" = false
     RETURNING "id"`, [userId, otherUserId]);
        return result.rows;
    });
}
function getUnreadCount(userId, otherUserId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield exports.pool.query(`SELECT COUNT(*) as unread_count
     FROM public.messages 
     WHERE "receiver_id" = $1 AND "sender_id" = $2 AND "is_read" = false`, [userId, otherUserId]);
        return Number(result.rows[0].unread_count);
    });
}
function deleteUserByEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const result = yield exports.pool.query(`DELETE FROM public.users
     WHERE email = $1
     RETURNING *`, [email]);
        return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
    });
}
function updateUserTypeByEmail(email, newUserType) {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield exports.pool.connect();
        try {
            yield client.query("BEGIN");
            const current = yield client.query(`SELECT id AS user_id, user_type FROM public.users WHERE email = $1`, [email]);
            if (current.rows.length === 0) {
                yield client.query("ROLLBACK");
                return null;
            }
            const { user_id, user_type: currentUserType } = current.rows[0];
            // If the user type is already the same, no need to update
            if (currentUserType === newUserType) {
                yield client.query("ROLLBACK");
                return null;
            }
            const result = yield client.query(`UPDATE public.users
       SET user_type = $1
       WHERE email = $2
       RETURNING *`, [newUserType, email]);
            // Handle teachers table updates
            if (newUserType === "teacher") {
                // Promote: Add to teachers table if not already there
                yield client.query(`INSERT INTO public.teachers (user_id, category_id)
         SELECT $1, 1
         WHERE NOT EXISTS (
           SELECT 1 FROM public.teachers WHERE user_id = $1
         )`, [user_id]);
            }
            else if (currentUserType === "teacher") {
                // Demote: Remove from teachers table if they were a teacher
                yield client.query(`DELETE FROM public.teachers WHERE user_id = $1`, [user_id]);
            }
            yield client.query("COMMIT");
            return result.rows[0];
        }
        catch (err) {
            yield client.query("ROLLBACK");
            throw err;
        }
        finally {
            client.release();
        }
    });
}
function createProgress(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const { user_id, lesson_id } = data;
        const result = yield exports.pool.query(`INSERT INTO public.progress ("user_id", "lesson_id")
     VALUES ($1, $2)
     ON CONFLICT ("user_id", "lesson_id") DO NOTHING
     RETURNING "id", "user_id", "lesson_id", "created_at"`, [user_id, lesson_id]);
        return result.rows[0];
    });
}
function getProgressByUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield exports.pool.query(`SELECT p.*, 
            l.title as lesson_title, 
            l.description as lesson_description, 
            l.video_url as lesson_video_url,
            c.id as course_id,
            c.title as course_title,
            u.first_name as teacher_first_name, 
            u.last_name as teacher_last_name
     FROM public.progress p
     JOIN public.lessons l ON p.lesson_id = l.id
     JOIN public.courses c ON l.course_id = c.id
     JOIN public.users u ON l.teacher_id = u.id
     WHERE p.user_id = $1
     ORDER BY p.created_at DESC`, [userId]);
        return result.rows;
    });
}
function getProgressById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield exports.pool.query(`SELECT * FROM public.progress WHERE "id" = $1`, [id]);
        return result.rows[0] || null;
    });
}
function getProgressByUserAndLesson(userId, lessonId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield exports.pool.query(`SELECT * FROM public.progress WHERE "user_id" = $1 AND "lesson_id" = $2`, [
            userId,
            lessonId,
        ]);
        return result.rows[0] || null;
    });
}
function deleteProgress(id) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const result = yield exports.pool.query(`DELETE FROM public.progress WHERE "id" = $1`, [id]);
        return ((_a = result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
    });
}
function deleteProgressByUserAndLesson(userId, lessonId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const result = yield exports.pool.query(`DELETE FROM public.progress WHERE "user_id" = $1 AND "lesson_id" = $2`, [
            userId,
            lessonId,
        ]);
        return ((_a = result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
    });
}
