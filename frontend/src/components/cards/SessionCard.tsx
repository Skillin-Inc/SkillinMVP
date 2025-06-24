import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../styles";

interface SessionCardProps {
  title: string;
  time: string;
  type: string;
  onPress: () => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ title, time, type, onPress }) => {
  const getSessionIcon = (sessionType: string) => {
    switch (sessionType) {
      case "private":
        return "person-outline";
      case "group":
        return "people-outline";
      case "office":
        return "time-outline";
      default:
        return "calendar-outline";
    }
  };

  return (
    <TouchableOpacity style={styles.sessionCard} onPress={onPress}>
      <View style={styles.sessionIcon}>
        <Ionicons name={getSessionIcon(type)} size={20} color={COLORS.purple} />
      </View>
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionTitle}>{title}</Text>
        <Text style={styles.sessionTime}>{time}</Text>
      </View>
      <View style={styles.sessionActions}>
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  sessionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    marginBottom: 4,
  },
  sessionTime: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  sessionActions: {
    padding: 8,
  },
});

export default SessionCard;
