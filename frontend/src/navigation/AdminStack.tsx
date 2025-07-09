import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import AdminTabs from "./AdminTabs";
import AdminUsers from "../screens/admin/AdminUsers";
import AdminCourses from "../screens/admin/AdminCourses";
import AdminCategories from "../screens/admin/AdminCategories";
import Chat from "../screens/shared/Chat";
import { AdminStackParamList } from "../types/navigation";

const Stack = createStackNavigator<AdminStackParamList>();

export default function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      <Stack.Screen
        name="AdminUsers"
        component={AdminUsers}
        options={{
          headerShown: true,
          title: "User Management",
        }}
      />
      <Stack.Screen
        name="AdminCourses"
        component={AdminCourses}
        options={{
          headerShown: true,
          title: "Course Management",
        }}
      />
      <Stack.Screen
        name="AdminCategories"
        component={AdminCategories}
        options={{
          headerShown: true,
          title: "Category Management",
        }}
      />
      <Stack.Screen name="Chat" component={Chat} />
    </Stack.Navigator>
  );
}
