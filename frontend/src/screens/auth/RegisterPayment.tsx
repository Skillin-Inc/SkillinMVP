import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { useScreenDimensions } from "../../hooks";
import { COLORS } from "../../styles";
import { StackScreenProps } from "@react-navigation/stack";
import { AuthStackParamList } from "../../types";

type Props = StackScreenProps<AuthStackParamList, "RegisterPayment">;

export default function RegisterPayment({ navigation }: Props) {
  const { screenWidth, screenHeight } = useScreenDimensions();
  const styles = getStyles(screenWidth, screenHeight);

  const handlePaymentPress = () => {
    Linking.openURL("https://buy.stripe.com/9AQ03wbg7ayg7SM288");
    navigation.navigate("Welcome");
  };

  return (
    <View style={styles.container}>
      {/* Optional back arrow */}
      {/* <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color={COLORS.purple} />
      </TouchableOpacity> */}

      <Text style={styles.message}>
        Great! You're now registered. Continue to the payment gateway to claim your 14-day free trial using the email
        you signed up with.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handlePaymentPress}>
        <Text style={styles.buttonText}>Go to Payment Gateway</Text>
      </TouchableOpacity>
    </View>
  );
}

function getStyles(width: number, height: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: COLORS.white,
    },
    backButton: {
      position: "absolute",
      top: height * 0.06,
      left: width * 0.04,
      zIndex: 10,
    },
    message: {
      fontSize: 18,
      textAlign: "center",
      marginBottom: 30,
      color: COLORS.black,
      marginTop: height * 0.1,
    },
    button: {
      backgroundColor: COLORS.purple,
      paddingVertical: 12,
      paddingHorizontal: 25,
      borderRadius: 10,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
  });
}
