import React from "react";
import { Text, StyleSheet, TouchableOpacity, View, Image, ImageSourcePropType } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACINGS } from "../../styles";

type Props = {
  label: string;
  image: ImageSourcePropType;
  onPress?: () => void;
  disabled?: boolean;
};

export default function CategoryCard({ label, image, onPress, disabled = false }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, disabled && styles.cardDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image source={image} style={styles.image} />
        <View style={styles.imageOverlay}>
          <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {label}
        </Text>
        <View style={styles.actionHint}>
          <Text style={styles.actionText}>Explore topic</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.gray} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: SPACINGS.base,
    width: 160,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  imageContainer: {
    height: 120,
    backgroundColor: COLORS.purple,
    position: "relative",
    padding: SPACINGS.base,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  imageOverlay: {
    position: "absolute",
    top: SPACINGS.small,
    right: SPACINGS.small,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    padding: SPACINGS.base,
    flex: 1,
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.black,
    lineHeight: 22,
    marginBottom: SPACINGS.small,
  },
  actionHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
  },
  actionText: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: "500",
  },
});
