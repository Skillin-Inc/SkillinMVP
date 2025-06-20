// navigation.ts
import { NavigatorScreenParams } from "@react-navigation/native";
import { PersonalInfo, TeachingExperience } from "./index";

export type StudentTabsParamList = {
  StudentHome: undefined;
  StudentProgress: undefined;
  Messages: undefined;
  StudentProfile: undefined;
  Temp: undefined;
};

export type TeacherTabsParamList = {
  TeacherHome: undefined;
  TeacherCreateLesson: undefined;
  Messages: undefined;
  TeacherProfile: undefined;
  Temp: undefined;
};

export type AdminTabsParamList = {
  AdminHome: undefined;
  UserManagement: undefined;
  CourseManagement: undefined;
  Messages: undefined;
};

export type StudentStackParamList = {
  StudentTabs: NavigatorScreenParams<StudentTabsParamList>;
  StudentTopicDetail: { id: string };
  StudentCourse: { courseId: number };
  StudentLesson: { lessonId: number };
  Chat: { id: string };
};

export type TeacherStackParamList = {
  TeacherTabs: NavigatorScreenParams<TeacherTabsParamList>;
  TeacherStats: undefined;
  TeacherCreateCourse: undefined;
  TeacherCoursesList: undefined;
  TeacherCourse: { courseId: number };
  TeacherLesson: { lessonId: number };
  Chat: { id: string };
};

export type AdminStackParamList = {
  AdminTabs: NavigatorScreenParams<AdminTabsParamList>;
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
    dOB: string;
    zipCode: string;
    email: string;
    phoneNumber: string;
    postalCode: number;
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
