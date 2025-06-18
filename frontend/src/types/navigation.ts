// navigation.ts
import { NavigatorScreenParams } from "@react-navigation/native";
import { PersonalInfo, TeachingExperience } from "./index";

export type StudentTabsParamList = {
  StudentHome: undefined;
  Messages: undefined;
  StudentProfile: undefined;
  Temp: undefined;
};

export type TeacherTabsParamList = {
  TeacherHome: undefined;
  TeacherCreateLesson: undefined;
  TeacherStats: undefined;
  Messages: undefined;
  Temp: undefined;
};

export type StudentStackParamList = {
  StudentTabs: NavigatorScreenParams<StudentTabsParamList>;
  StudentTopicDetail: { id: string };
  StudentAltCategoryDetail: { id: string };
  Chat: { id: string };
};

export type TeacherStackParamList = {
  TeacherTabs: NavigatorScreenParams<TeacherTabsParamList>;
  TeacherCreateCourse: undefined;
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
};
