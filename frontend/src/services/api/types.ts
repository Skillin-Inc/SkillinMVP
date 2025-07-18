export interface RegisterData {
  id?: string; // Cognito userSub
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  username: string;
  password: string;
  userType?: "student" | "teacher" | "admin";
}

export interface LoginData {
  emailOrPhone: string;
  password: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  username: string;
  createdAt: string;
  userType: "student" | "teacher" | "admin";
  membershipTier?: string;
  date_of_birth?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  created_at?: string;
  user_type?: "student" | "teacher" | "admin";
  stripeCustomerId?: string;
}

export interface BackendUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  username: string;
  created_at: string;
  stripe_customer_id?: string;
  user_type: "student" | "teacher" | "admin";
  date_of_birth?: string;
}

export interface UpdateUserProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  username?: string;
}

export interface LoginResponse {
  success: boolean;
  user: User;
}

export interface BackendMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_first_name?: string;
  sender_last_name?: string;
  receiver_first_name?: string;
  receiver_last_name?: string;
}

export interface NewMessage {
  sender_id: string;
  receiver_id: string;
  content: string;
}

export interface Conversation {
  other_user_id: string;
  other_user_first_name: string;
  other_user_last_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export interface NewCategory {
  title: string;
}

export interface Category {
  id: string;
  title: string;
}

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
