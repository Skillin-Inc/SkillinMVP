import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../styles";

interface ActionButtonProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

interface ActionButtonsProps {
  primaryAction?: ActionButtonProps;
  secondaryActions?: ActionButtonProps[];
  dangerAction?: ActionButtonProps;
  style?: ViewStyle;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ primaryAction, secondaryActions = [], dangerAction, style }) => {
  const renderButton = (action: ActionButtonProps, buttonStyle: ViewStyle, textStyle: TextStyle) => (
    <TouchableOpacity
      style={[buttonStyle, action.disabled && styles.disabledButton]}
      onPress={action.onPress}
      disabled={action.disabled || action.loading}
    >
      {action.loading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <>
          {action.icon && <Ionicons name={action.icon} size={20} color={textStyle.color} />}
          <Text style={[textStyle, action.icon && { marginLeft: 8 }]}>{action.title}</Text>
        </>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.actionsSection, style]}>
      {primaryAction && renderButton(primaryAction, styles.primaryAction, styles.primaryActionText)}

      {(secondaryActions.length > 0 || dangerAction) && (
        <View style={styles.secondaryActions}>
          {secondaryActions.map((action, index) => (
            <View key={index} style={styles.secondaryActionWrapper}>
              {renderButton(action, styles.secondaryAction, styles.secondaryActionText)}
            </View>
          ))}

          {dangerAction && (
            <View style={styles.secondaryActionWrapper}>
              {renderButton(dangerAction, styles.dangerAction, styles.dangerActionText)}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  actionsSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  primaryAction: {
    backgroundColor: COLORS.purple,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  primaryActionText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  secondaryActionWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  secondaryAction: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.purple,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryActionText: {
    color: COLORS.purple,
    fontSize: 14,
    fontWeight: "600",
  },
  dangerAction: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dangerActionText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default ActionButtons;
