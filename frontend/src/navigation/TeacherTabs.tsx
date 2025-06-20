import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import TeacherHome from "../screens/teachers/TeacherHome";
import TeacherCreateLesson from "../screens/teachers/TeacherCreateLesson";
import Messages from "../screens/shared/Messages";
import TeacherProfile from "../screens/teachers/TeacherProfile";
import Temp from "../screens/shared/Temp";

import { COLORS } from "../styles";
import { TeacherTabsParamList } from "../types/navigation";

const Tab = createBottomTabNavigator<TeacherTabsParamList>();

export default function TeacherTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "TeacherHome") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "TeacherCreateLesson") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "Messages") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          } else if (route.name === "TeacherProfile") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "Temp") {
            iconName = focused ? "settings" : "settings-outline";
          } else {
            iconName = "help-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.blue,
        tabBarInactiveTintColor: "gray",
        headerShown: false,
      })}
    >
      <Tab.Screen name="TeacherHome" component={TeacherHome} />
      <Tab.Screen name="TeacherCreateLesson" component={TeacherCreateLesson} />
      <Tab.Screen name="Messages" component={Messages} />
      <Tab.Screen name="TeacherProfile" component={TeacherProfile} />
      <Tab.Screen name="Temp" component={Temp} />
    </Tab.Navigator>
  );
}
