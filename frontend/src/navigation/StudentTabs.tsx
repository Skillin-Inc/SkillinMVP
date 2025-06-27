import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, Alert } from "react-native";

import StudentHome from "../screens/students/StudentHome";
import StudentProgress from "../screens/students/StudentProgress";
import Messages from "../screens/shared/Messages";
import StudentProfile from "../screens/students/StudentProfile";
import Temp from "../screens/shared/Temp";

import { COLORS } from "../styles";
import { StudentTabsParamList } from "../types/navigation";

const Tab = createBottomTabNavigator<StudentTabsParamList>();

export default function StudentTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "StudentHome") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "StudentProgress") {
            iconName = focused ? "play-circle" : "play-circle-outline";
          } else if (route.name === "Messages") {
            iconName = focused ? "chatbubbles" : "chatbubbles-outline";
          } else if (route.name === "StudentProfile") {
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
      <Tab.Screen name="StudentHome" component={StudentHome} options={{ tabBarLabel: "Home" }} />
      <Tab.Screen
        name="StudentProgress"
        component={StudentProgress} // still required by type system
        options={{
          tabBarLabel: "Progress",
          title: "My Progress",
          tabBarButton: (props: any) => (
            <TouchableOpacity
              {...props}
              onPress={() => Alert.alert("Premium Feature", "This feature is premium-only and coming soon!")}
            />
          ),
        }}
      />
      <Tab.Screen name="Messages" component={Messages} />
      <Tab.Screen name="StudentProfile" component={StudentProfile} options={{ tabBarLabel: "Profile" }} />
      <Tab.Screen name="Temp" component={Temp} />
    </Tab.Navigator>
  );
}
