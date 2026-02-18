import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { PremiumCrown } from "@/components/PremiumCrown";
import { ButtonFont, mainAussieBlue } from "@/constants/theme";

const CROWN_GOLD = "#F4B744";

type PremiumThanksModalProps = {
  visible: boolean;
  onClose: () => void;
};

/**
 * Reusable "You are on Premium" thank-you card.
 * Shown when the user taps the premium tick in any header. Update the message here and it updates everywhere.
 */
export function PremiumThanksModal({
  visible,
  onClose,
}: PremiumThanksModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.iconsRow}>
            <PremiumCrown size={36} />
            <MaterialCommunityIcons
              name="check-decagram-outline"
              size={38}
              color={CROWN_GOLD}
            />
          </View>
          <Text style={styles.text}>
            You are on the Premium version, Thanks for supporting the app!
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: mainAussieBlue,
    borderRadius: 16,
    padding: 24,
    maxWidth: 320,
    minWidth: 280,
    borderWidth: 2,
    borderColor: "#fff",
  },
  iconsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },
  text: {
    fontFamily: ButtonFont,
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: "100%",
    minWidth: 250,
    borderRadius: 10,
    textAlign: "center",
    alignSelf: "center",
  },
  buttonText: {
    fontFamily: ButtonFont,
    fontSize: 20,
    color: mainAussieBlue,
    textAlign: "center",
  },
});
