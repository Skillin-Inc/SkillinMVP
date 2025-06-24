//src/screens/student/StudentSubscription.tsx
//Description: Page for managing subscription and all kinds of billing sht

import React from 'react';
import {View, Text, StyleSheet, SafeAreaView} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACINGS } from "../../styles";

export default function StudentSubscription(){
    return (
        <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Subscription</Text>
      <Text style={styles.description}>Manage your billing and payment methods here.</Text>
      {/* 你可以在這裡整合 Stripe Portal 或其他訂閱功能 */}
    </SafeAreaView>
    );
}

const styles =  StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACINGS.base,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: SPACINGS.base,
  },
  description: {
    fontSize: 16,
    color: COLORS.gray,
  },
});