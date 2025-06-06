import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import TeacherHome from "../screens/TeacherHome";
import MessagesStack from "./MessagesStack";
import StatsScreen from "../screens/Stats"; // Placeholder screen
import CreateLesson from "../screens/CreateLesson";
import { COLORS } from "../styles";

const Tab = createBottomTabNavigator();

export default function TeacherTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="TeacherHome"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.purple,
        tabBarInactiveTintColor: "gray",
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home-outline";

          switch (route.name) {
            case "TeacherHome":
              iconName = "home-outline";
              break;
            case "CreateLesson":
              iconName = "add-circle-outline";
              break;
            case "Messages":
              iconName = "chatbubble-ellipses-outline";
              break;
            case "Stats":
              iconName = "bar-chart-outline";
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="TeacherHome" component={TeacherHome} options={{ title: "Home" }} />
      <Tab.Screen name="CreateLesson" component={CreateLesson} options={{ title: "Create" }} />
      <Tab.Screen name="Messages" component={MessagesStack} />
      <Tab.Screen name="Stats" component={StatsScreen} />
    </Tab.Navigator>
  );
}
