import React from "react";
import { Text, StyleSheet, TouchableOpacity, View, Image, Dimensions } from "react-native";
import { COLORS } from "../styles";

const { width, height } = Dimensions.get("window");

type Props = {
  label: string;
  image: any; // or ImageSourcePropType
  onPress?: () => void;
};

export default function CategoryCard({ label, image, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Top Section with Image on Purple Background */}
      <View style={styles.imageContainer}>
        <Image source={image} style={styles.image} />
      </View>

      {/* Bottom Section with Green Label */}
      <View style={styles.labelContainer}>
        <Text style={styles.cardText}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: width * 0.35,
    height: height * 0.25,
    borderRadius: 16,
    overflow: "hidden",
    marginRight: 16,
    backgroundColor: "#fff",
    elevation: 5,
  },
  imageContainer: {
    flex: 2,
    backgroundColor: COLORS.purple, // Purple background
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  labelContainer: {
    flex: 1,
    backgroundColor: COLORS.green, // Green background
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  cardText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
