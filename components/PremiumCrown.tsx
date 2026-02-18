import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleProp, ViewStyle } from "react-native";

const CROWN_GOLD = "#F4B744";

type PremiumCrownProps = {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function PremiumCrown({ size = 26, style }: PremiumCrownProps) {
  return (
    <MaterialCommunityIcons
      name="check-decagram-outline"
      size={size}
      color={CROWN_GOLD}
      style={style}
    />
  );
}
