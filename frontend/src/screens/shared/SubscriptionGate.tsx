import React from "react";
import { Text, TouchableOpacity, Alert,Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchAuthSession } from "aws-amplify/auth";
import { COLORS } from "../../styles";
import { StudentStackParamList } from "../../types/navigation";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<StudentStackParamList, "SubscriptionGate">;
const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL;


export default function SubscriptionGate({ route }: Props) {
  const { user, checkPaidStatus, setFreeMode} = route.params;

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 , textAlign: "center"}}>
        Subscription Required
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 20, textAlign: "center" }}>
        You haven't subscribed yet. Please complete payment or choose Free Mode.
      </Text>

      <TouchableOpacity
        onPress={async () => {
          try {
            console.log("Creating checkout session for user:", user?.id, user?.email);
            const res = await fetch(`${BACKEND_URL}/stripe/create-checkout-session`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: user?.id, email: user?.email }),
            });
            const data = await res.json();
            console.log("Checkout session response:", data);
            if (data.url) Linking.openURL(data.url);
            else Alert.alert("Error", "Failed to create checkout session.");
          } catch (error) {
            Alert.alert("Error", "Unable to initiate payment.");
            console.error("Checkout error:", error);
          }
        }}
        style={{
          backgroundColor: COLORS.purple,
          padding: 12,
          borderRadius: 8,
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Subscribe Now</Text>
      </TouchableOpacity>


      <TouchableOpacity
        onPress={async () => {
          try {
            console.log("Checking paid status for user:", user?.id);
            const res = await fetch(`${BACKEND_URL}/stripe/check-paid-status`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: user?.id }),
            });
            const data = await res.json();
            console.log("Paid status response:", data);
            if (data.isPaid) {
              Alert.alert("Success", "Payment confirmed! Redirecting...");
              checkPaidStatus(user?.id);
            } else {
              Alert.alert("Payment not found", "No active subscription found. Please complete payment first.");
            }
          } catch (error) {
            Alert.alert("Error", "Unable to check payment status.");
            console.error("Check paid status error:", error);
          }
        }}
        style={{
          backgroundColor: COLORS.purple,
          padding: 12,
          borderRadius: 8,
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>I Already Paid</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={async () => {
          try {
            console.log("Setting free mode for user:", user?.id);
            console.log("BACKEND_URL:", BACKEND_URL);
            
            // Get authentication token
            const session = await fetchAuthSession();
            const token = session.tokens?.idToken?.toString();
            
            if (!token) {
              Alert.alert("Error", "Authentication token not found. Please log in again.");
              return;
            }

            const res = await fetch(`${BACKEND_URL}/users/set-free-mode`, {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({ userId: user?.id }),
            });
            const data = await res.json();
            console.log("Free mode response:", data);
            if (data.success) {
              await AsyncStorage.setItem("freeMode", "true");
              setFreeMode(true);
              Alert.alert("Success", "Free mode enabled! You now have limited access.");
            } else {
              Alert.alert("Error", "Failed to enable free mode.");
            }
          } catch (error) {
            console.error("Start free mode error:", error);
            Alert.alert("Error", "Unable to start free mode.");
          }
        }}
        style={{
          backgroundColor: COLORS.purple,
          padding: 12,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>Start Free</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
