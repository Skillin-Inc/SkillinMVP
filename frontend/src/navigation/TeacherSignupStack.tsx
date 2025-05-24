// navigation/const TeacherSignupStack.tsx
import { createStackNavigator } from "@react-navigation/stack";

import ApplicationStartScreen from "../screens/teacherSignup/ApplicationStart";
import PayoutsInfoScreen from "../screens/teacherSignup/PayoutsInfo";
import PersonalInfoScreen from "../screens/teacherSignup/PersonalInfo";
import TeachingExperienceScreen from "../screens/teacherSignup/TeachingExperienceScreen";
import VerificationScreen from "../screens/teacherSignup/Verification";
import ReviewSubmitScreen from "../screens/teacherSignup/ReviewAndSubmit";
import { TeacherStackParamList } from "../types";

const TeacherSignupStack = createStackNavigator<TeacherStackParamList>();

export default function TeacherNavigator() {
  return (
    <TeacherSignupStack.Navigator screenOptions={{ headerShown: false }}>
      <TeacherSignupStack.Screen name="ApplicationStart" component={ApplicationStartScreen} />
      <TeacherSignupStack.Screen name="PayoutsInfo" component={PayoutsInfoScreen} />
      <TeacherSignupStack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <TeacherSignupStack.Screen name="TeachingExperience" component={TeachingExperienceScreen} />
      <TeacherSignupStack.Screen name="Verification" component={VerificationScreen} />
      <TeacherSignupStack.Screen name="ReviewSubmit" component={ReviewSubmitScreen} />
    </TeacherSignupStack.Navigator>
  );
}
