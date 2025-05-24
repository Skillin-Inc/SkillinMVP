import { NavigatorScreenParams } from "@react-navigation/native";

import { PersonalInfo, TeachingExperience } from "./teacher";

export type TabNavigatorParamList = {
  Home: undefined;
  Profile: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  TeacherNavigator: NavigatorScreenParams<TeacherStackParamList>;
  Register: undefined;
};

export type TeacherStackParamList = {
  PersonalInfo: undefined;
  PayoutsInfo: undefined;
  TeachingExperience: PersonalInfo;
  Verification: PersonalInfo & TeachingExperience;
  ReviewSubmit: PersonalInfo &
    TeachingExperience & {
      idFront: string | null;
      idBack: string | null;
    };
  ApplicationStart: undefined;
};
