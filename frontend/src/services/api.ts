import { API_CONFIG } from "../config/api";

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  username: string;
  password: string;
  postalCode: number;
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
  phoneNumber: string;
  username: string;
  postalCode: number;
  createdAt: string;
  userType: "student" | "teacher" | "admin";
  membershipTier?: string;
  dOB?: string;
  hashedPassword?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  postal_code?: number;
  created_at?: string;
  user_type?: "student" | "teacher" | "admin";
  hashed_password?: string;
}

export interface BackendUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  username: string;
  postal_code: number;
  created_at: string;
  user_type: "student" | "teacher" | "admin";
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

function createApiService() {
  const transformBackendUserToUser = (backendUser: BackendUser): User => {
    return {
      id: backendUser.id,
      firstName: backendUser.first_name,
      lastName: backendUser.last_name,
      email: backendUser.email,
      phoneNumber: backendUser.phone_number,
      username: backendUser.username,
      postalCode: backendUser.postal_code,
      createdAt: backendUser.created_at,
      userType: backendUser.user_type,
    };
  };

  const makeRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred");
    }
  };

  const register = async (userData: RegisterData): Promise<User> => {
    const backendUser = await makeRequest<BackendUser>(API_CONFIG.ENDPOINTS.USERS, {
      method: "POST",
      body: JSON.stringify(userData),
    });
    return transformBackendUserToUser(backendUser);
  };

  const login = async (loginData: LoginData): Promise<LoginResponse> => {
    const response = await makeRequest<{ success: boolean; user: BackendUser }>(API_CONFIG.ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify(loginData),
    });

    return {
      success: response.success,
      user: transformBackendUserToUser(response.user),
    };
  };

  const getUserById = async (id: string): Promise<BackendUser> => {
    return makeRequest<BackendUser>(`${API_CONFIG.ENDPOINTS.USERS}/${id}`);
  };

  const getAllUsers = async (): Promise<BackendUser[]> => {
    return makeRequest<BackendUser[]>(API_CONFIG.ENDPOINTS.USERS);
  };

  const getConversationsForUser = async (id: string): Promise<Conversation[]> => {
    return makeRequest<Conversation[]>(`${API_CONFIG.ENDPOINTS.MESSAGES}/conversations/${id}`);
  };

  const getMessagesBetweenUsers = async (id1: string, id2: string): Promise<BackendMessage[]> => {
    return makeRequest<BackendMessage[]>(`${API_CONFIG.ENDPOINTS.MESSAGES}/between/${id1}/${id2}`);
  };

  const createMessage = async (messageData: NewMessage): Promise<BackendMessage> => {
    return makeRequest<BackendMessage>(API_CONFIG.ENDPOINTS.MESSAGES, {
      method: "POST",
      body: JSON.stringify(messageData),
    });
  };

  const markMessagesAsRead = async (
    userId: string,
    otherUserId: string
  ): Promise<{ message: string; count: number }> => {
    return makeRequest<{ message: string; count: number }>(
      `${API_CONFIG.ENDPOINTS.MESSAGES}/mark-read/${userId}/${otherUserId}`,
      {
        method: "PUT",
      }
    );
  };

  const createLesson = async (lessonData: NewLesson): Promise<Lesson> => {
    return makeRequest<Lesson>(API_CONFIG.ENDPOINTS.LESSONS, {
      method: "POST",
      body: JSON.stringify(lessonData),
    });
  };

  const getAllLessons = async (): Promise<Lesson[]> => {
    return makeRequest<Lesson[]>(API_CONFIG.ENDPOINTS.LESSONS);
  };

  const getLessonById = async (id: string): Promise<Lesson> => {
    return makeRequest<Lesson>(`${API_CONFIG.ENDPOINTS.LESSONS}/${id}`);
  };

  const getLessonsByTeacher = async (teacherId: string): Promise<Lesson[]> => {
    return makeRequest<Lesson[]>(`${API_CONFIG.ENDPOINTS.LESSONS}/teacher/${teacherId}`);
  };

  const updateLesson = async (id: string, updateData: Partial<NewLesson>): Promise<Lesson> => {
    return makeRequest<Lesson>(`${API_CONFIG.ENDPOINTS.LESSONS}/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  };

  const deleteLesson = async (id: string): Promise<{ success: boolean; message: string }> => {
    return makeRequest<{ success: boolean; message: string }>(`${API_CONFIG.ENDPOINTS.LESSONS}/${id}`, {
      method: "DELETE",
    });
  };

  const getLessonsByCourse = async (courseId: string): Promise<Lesson[]> => {
    return makeRequest<Lesson[]>(`${API_CONFIG.ENDPOINTS.LESSONS}/course/${courseId}`);
  };

  const createCourse = async (courseData: NewCourse): Promise<Course> => {
    return makeRequest<Course>(API_CONFIG.ENDPOINTS.COURSES, {
      method: "POST",
      body: JSON.stringify(courseData),
    });
  };

  const getAllCourses = async (): Promise<Course[]> => {
    return makeRequest<Course[]>(API_CONFIG.ENDPOINTS.COURSES);
  };

  const getCourseById = async (id: string): Promise<Course> => {
    return makeRequest<Course>(`${API_CONFIG.ENDPOINTS.COURSES}/${id}`);
  };

  const getCoursesByTeacher = async (teacherId: string): Promise<Course[]> => {
    return makeRequest<Course[]>(`${API_CONFIG.ENDPOINTS.COURSES}/teacher/${teacherId}`);
  };

  const updateCourse = async (id: string, updateData: Partial<NewCourse>): Promise<Course> => {
    return makeRequest<Course>(`${API_CONFIG.ENDPOINTS.COURSES}/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  };

  const deleteCourse = async (id: string): Promise<{ success: boolean; message: string }> => {
    return makeRequest<{ success: boolean; message: string }>(`${API_CONFIG.ENDPOINTS.COURSES}/${id}`, {
      method: "DELETE",
    });
  };

  const getCoursesByCategory = async (categoryId: string, limit?: number, offset?: number): Promise<Course[]> => {
    let endpoint = `${API_CONFIG.ENDPOINTS.COURSES}/category/${categoryId}`;

    const params = new URLSearchParams();
    if (limit !== undefined) {
      params.append("limit", limit.toString());
    }
    if (offset !== undefined) {
      params.append("offset", offset.toString());
    }

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return makeRequest<Course[]>(endpoint);
  };

  const createCategory = async (categoryData: NewCategory): Promise<Category> => {
    return makeRequest<Category>(API_CONFIG.ENDPOINTS.CATEGORIES, {
      method: "POST",
      body: JSON.stringify(categoryData),
    });
  };

  const getAllCategories = async (): Promise<Category[]> => {
    return makeRequest<Category[]>(API_CONFIG.ENDPOINTS.CATEGORIES);
  };

  const getCategoryById = async (id: string): Promise<Category> => {
    return makeRequest<Category>(`${API_CONFIG.ENDPOINTS.CATEGORIES}/${id}`);
  };

  const updateCategory = async (id: string, updateData: Partial<NewCategory>): Promise<Category> => {
    return makeRequest<Category>(`${API_CONFIG.ENDPOINTS.CATEGORIES}/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
  };

  const deleteCategory = async (id: string): Promise<{ success: boolean; message: string }> => {
    return makeRequest<{ success: boolean; message: string }>(`${API_CONFIG.ENDPOINTS.CATEGORIES}/${id}`, {
      method: "DELETE",
    });
  };

  const deleteUser = async (email: string): Promise<{ success: boolean; message: string }> => {
    const encodedEmail = encodeURIComponent(email);
    return makeRequest<{ success: boolean; message: string }>(`${API_CONFIG.ENDPOINTS.USERS}/${encodedEmail}`, {
      method: "DELETE",
    });
  };

  const updateUserType = async (
    email: string,
    userType: "student" | "teacher" | "admin"
  ): Promise<{ success: boolean; message: string }> => {
    const encodedEmail = encodeURIComponent(email);
    return makeRequest<{ success: boolean; message: string }>(
      `${API_CONFIG.ENDPOINTS.USERS}/${encodedEmail}/user-type`,
      {
        method: "PATCH",
        body: JSON.stringify({ userType }),
      }
    );
  };

  return {
    register,
    login,
    getUserById,
    getAllUsers,
    getConversationsForUser,
    getMessagesBetweenUsers,
    createMessage,
    markMessagesAsRead,
    createLesson,
    getAllLessons,
    getLessonById,
    getLessonsByTeacher,
    updateLesson,
    deleteLesson,
    getLessonsByCourse,
    createCourse,
    getAllCourses,
    getCourseById,
    getCoursesByTeacher,
    updateCourse,
    deleteCourse,
    getCoursesByCategory,
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    deleteUser,
    updateUserType,
  };
}

export const api = createApiService();

export const transformBackendUserToUser = (backendUser: BackendUser): User => {
  return {
    id: backendUser.id,
    firstName: backendUser.first_name,
    lastName: backendUser.last_name,
    email: backendUser.email,
    phoneNumber: backendUser.phone_number,
    username: backendUser.username,
    postalCode: backendUser.postal_code,
    createdAt: backendUser.created_at,
    userType: backendUser.user_type,
  };
};
