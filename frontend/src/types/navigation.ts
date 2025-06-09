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
  ApplicationStart: undefined;
  PersonalInfo: undefined;
  PayoutsInfo: undefined;
  TeachingExperience: PersonalInfo;
  Verification: PersonalInfo & TeachingExperience;
  ReviewSubmit: PersonalInfo &
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
  Register: undefined;
  TeacherNavigator: NavigatorScreenParams<TeacherStackParamList>;
};
// App Root
export type RootStackParamList = {
  UserTabs: undefined;
  TeacherHome: undefined;
  TeacherTabs: undefined;
  Profile: { from: "TeacherHome" | "Home" };
  TopicDetail: { topic: string };
  CreateCourse: undefined;
};
