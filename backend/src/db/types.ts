// Database types and interfaces
export type QueryParam = string | number | boolean | null | undefined;

// User interfaces
export interface NewUser {
  id?: string; // Cognito userSub
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  username: string;
  userType: "student" | "teacher" | "admin";
  dateOfBirth?: string;
}

export interface UpdateUserProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  username?: string;
}

// Message interfaces
export interface NewMessage {
  sender_id: string;
  receiver_id: string;
  content: string;
}

// Category interfaces
export interface NewCategory {
  title: string;
}

export interface Category {
  id: string;
  title: string;
}

// Course interfaces
export interface NewCourse {
  teacher_id: string;
  category_id: string;
  title: string;
  description: string;
}

export interface Course {
  id: string;
  teacher_id: string;
  category_id: string;
  title: string;
  description: string;
  created_at: string;
  teacher_first_name?: string;
  teacher_last_name?: string;
  teacher_username?: string;
}

// Lesson interfaces
export interface NewLesson {
  teacher_id: string;
  course_id: string;
  title: string;
  description: string;
  video_url: string;
}

export interface Lesson {
  id: string;
  teacher_id: string;
  course_id: string;
  title: string;
  description: string;
  video_url: string;
  created_at: string;
  teacher_first_name?: string;
  teacher_last_name?: string;
}

// Progress interfaces
export interface NewProgress {
  user_id: string;
  lesson_id: string;
}

export interface Progress {
  id: string;
  user_id: string;
  lesson_id: string;
  created_at: string;
}

export interface ProgressWithLessonDetails {
  id: string;
  user_id: string;
  lesson_id: string;
  created_at: string;
  lesson_title: string;
  lesson_description: string;
  lesson_video_url: string;
  course_id: string;
  course_title: string;
  teacher_first_name: string;
  teacher_last_name: string;
}
