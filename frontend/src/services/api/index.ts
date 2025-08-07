export * from "./types";

export { transformBackendUserToUser } from "./utils";

export * as users from "./users";
export * as messages from "./messages";
export * as lessons from "./lessons";
export * as courses from "./courses";
export * as categories from "./categories";

import * as users from "./users";
import * as messages from "./messages";
import * as lessons from "./lessons";
import * as courses from "./courses";
import * as categories from "./categories";

export const api = {
  // User methods
  createUser: users.createUser,
  getUserById: users.getUserById,
  getAllUsers: users.getAllUsers,
  deleteUser: users.deleteUser,
  updateUserType: users.updateUserType,
  updateUserProfile: users.updateUserProfile,
  checkUsernameAvailability: users.checkUsernameAvailability,

  // Message methods
  getConversationsForUser: messages.getConversationsForUser,
  getMessagesBetweenUsers: messages.getMessagesBetweenUsers,
  createMessage: messages.createMessage,
  markMessagesAsRead: messages.markMessagesAsRead,

  // Lesson methods
  createLesson: lessons.createLesson,
  getAllLessons: lessons.getAllLessons,
  getLessonById: lessons.getLessonById,
  getLessonsByTeacher: lessons.getLessonsByTeacher,
  updateLesson: lessons.updateLesson,
  deleteLesson: lessons.deleteLesson,
  getLessonsByCourse: lessons.getLessonsByCourse,

  // Course methods
  createCourse: courses.createCourse,
  getAllCourses: courses.getAllCourses,
  getCourseById: courses.getCourseById,
  getCoursesByTeacher: courses.getCoursesByTeacher,
  updateCourse: courses.updateCourse,
  deleteCourse: courses.deleteCourse,
  getCoursesByCategory: courses.getCoursesByCategory,

  // Category methods
  createCategory: categories.createCategory,
  getAllCategories: categories.getAllCategories,
  getCategoryById: categories.getCategoryById,
  updateCategory: categories.updateCategory,
  deleteCategory: categories.deleteCategory,
};
