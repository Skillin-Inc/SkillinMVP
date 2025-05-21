// src/Navigation.tsx
import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthContext } from "../hooks/AuthContext";

import AuthStack from "./AuthStack";
import TabNavigator from "./TabNavigator";
import { AppNavigatorParamList } from "../types";

const Stack = createStackNavigator<AppNavigatorParamList>();

export default function AppNavigator() {
  const { isLoggedIn, loading } = useContext(AuthContext);

  if (loading) return null;

  return <NavigationContainer>{isLoggedIn ? <TabNavigator /> : <AuthStack />}</NavigationContainer>;
}
