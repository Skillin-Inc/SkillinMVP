// src/Navigation.tsx
import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthContext } from "../hooks/AuthContext";

import AuthStack from "./AuthStack";
import TabNavigator from "./TabNavigator";
import TeacherTabNavigator from "./TeacherTabNavigator";
import AdminTabNavigator from "./AdminTabNavigator";

import TopicDetail from "../screens/usersScreensOnly/TopicDetail";
import AltCategoryDetail from "../screens/usersScreensOnly/AltCategoryDetail";
import Profile from "../screens/Profile";
import CreateCourse from "../screens/teacherScreensOnly/CreateCourse";

import { RootStackParamList } from "src/types";

const RootStack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isLoggedIn, loading, user } = useContext(AuthContext);

  if (loading) return null;

  // Determine which screen to show based on user type
  const getInitialRouteName = () => {
    if (!user) return "UserTabs";

    switch (user.userType) {
      case "admin":
        return "AdminTabs";
      case "teacher":
        return "TeacherTabs";
      case "student":
      default:
        return "UserTabs";
    }
  };

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <RootStack.Navigator screenOptions={{ headerShown: false }} initialRouteName={getInitialRouteName()}>
          <RootStack.Screen name="UserTabs" component={TabNavigator} />
          <RootStack.Screen name="TopicDetail" component={TopicDetail} />
          <RootStack.Screen name="AltCategoryDetail" component={AltCategoryDetail} />
          <RootStack.Screen name="TeacherTabs" component={TeacherTabNavigator} />
          <RootStack.Screen name="AdminTabs" component={AdminTabNavigator} />
          <RootStack.Screen name="Profile" component={Profile} />
          <RootStack.Screen name="CreateCourse" component={CreateCourse} />
        </RootStack.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
