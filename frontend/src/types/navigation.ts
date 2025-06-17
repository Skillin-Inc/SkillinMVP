// types.ts
import { NavigatorScreenParams } from "@react-navigation/native";
import { PersonalInfo, TeachingExperience } from "./index";

// Chat Stack
export type MessagesStackParamList = {
  Messages: undefined;
  Chat: { id: string };
};

// Tabs
export type TabNavigatorParamList = {
  Home: undefined;
  MessagesStack: NavigatorScreenParams<MessagesStackParamList>;
  Profile: undefined;
  Temp: undefined;
};

// Teacher Signup Flow
export type TeacherStackParamList = {
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

// Auth Stack
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
  TeacherNavigator: NavigatorScreenParams<TeacherStackParamList>;
};
// App Root
export type RootStackParamList = {
  UserTabs: undefined;
  TeacherHome: undefined;
  TeacherTabs: undefined;
  Profile: { from: "TeacherHome" | "Home" };
  TopicDetail: { topic: string };
  AltCategoryDetail: { topic: string }; // FIXED this line
  CreateCourse: undefined;
};
