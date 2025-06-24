import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../styles";

interface HeaderWithBackProps {
  title: string;
  onBackPress: () => void;
  rightComponent?: React.ReactNode;
  showBackButton?: boolean;
}

const HeaderWithBack: React.FC<HeaderWithBackProps> = ({
  title,
  onBackPress,
  rightComponent,
  showBackButton = true,
}) => {
  return (
    <View style={styles.headerContainer}>
      {showBackButton ? (
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>
      ) : (
        <View style={styles.headerSpacer} />
      )}
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitleText} numberOfLines={1}>
          {title}
        </Text>
      </View>
      {rightComponent ? rightComponent : <View style={styles.headerSpacer} />}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerSpacer: {
    width: 40,
  },
  headerTitleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.black,
  },
});

export default HeaderWithBack;
