// navigation.ts
import { NavigatorScreenParams } from "@react-navigation/native";
import { PersonalInfo, TeachingExperience } from "./index";

export type StudentTabsParamList = {
  StudentHome: undefined;
  StudentProgress: undefined;
  Messages: undefined;
  StudentProfile: { userId?: string };
  Temp: undefined;
};

export type TeacherTabsParamList = {
  TeacherHome: undefined;
  TeacherCreateLesson: undefined;
  Messages: undefined;
  TeacherProfile: { userId?: string };
  Temp: undefined;
};

export type AdminTabsParamList = {
  AdminHome: undefined;
  Analytics: undefined;
  Messages: undefined;
};

export type StudentStackParamList = {
  StudentTabs: NavigatorScreenParams<StudentTabsParamList>;
  StudentTopicDetail: { id: string };
  StudentCourse: { courseId: string };
  StudentLesson: { lessonId: string };
  TeacherProfile: { userId: string };
  Chat: { id: string };
  StudentSubscription: undefined;
  EditProfile: undefined;
};

export type TeacherStackParamList = {
  TeacherTabs: NavigatorScreenParams<TeacherTabsParamList>;
  TeacherStats: undefined;
  TeacherCreateCourse: undefined;
  TeacherCoursesList: undefined;
  TeacherCourse: { courseId: string };
  TeacherLesson: { lessonId: string };
  StudentProfile: { userId: string };
  Chat: { id: string };
  EditProfile: undefined;
};

export type AdminStackParamList = {
  AdminTabs: NavigatorScreenParams<AdminTabsParamList>;
  AdminUsers: undefined;
  AdminCourses: undefined;
  AdminCategories: undefined;
  Chat: { id: string };
};

export type TeacherAuthStackParamList = {
  TeacherStart: undefined;
  TeacherInfo: undefined;
  TeacherPayouts: undefined;
  TeacherExperience: PersonalInfo;
  TeacherSubmit: PersonalInfo &
    TeachingExperience & {
      idFront: string | null;
      idBack: string | null;
    };
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  RegisterPayment: undefined;
  StudentInfo: undefined;
  StudentAccount: {
    firstName: string;
    lastName: string;
    date_of_birth: string;
    email: string;
    phoneNumber?: string;
  };
  TeacherNavigator: NavigatorScreenParams<TeacherAuthStackParamList>;
};

export type RootStackParamList = {
  AuthStack: NavigatorScreenParams<AuthStackParamList>;
  TeacherAuthStack: NavigatorScreenParams<TeacherAuthStackParamList>;
  StudentStack: NavigatorScreenParams<StudentStackParamList>;
  TeacherStack: NavigatorScreenParams<TeacherStackParamList>;
  AdminStack: NavigatorScreenParams<AdminStackParamList>;
};
