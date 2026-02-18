import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { ButtonFont, mainAussieBlue } from "@/constants/theme";

type StyledAlertModalProps = {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
};

/**
 * Styled alert modal: main Aussie blue card, white text, single OK button.
 * Use instead of Alert.alert() when you want in-app styling.
 */
export function StyledAlertModal({
  visible,
  title,
  message,
  onClose,
}: StyledAlertModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
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
    alignSelf: "center",
    width: "90%",
    maxWidth: 360,
    minWidth: 300,
    borderWidth: 2,
    borderColor: "#fff",
  },
  title: {
    fontFamily: ButtonFont,
    fontSize: 18,
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
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
    borderRadius: 10,
    alignSelf: "center",
  },
  buttonText: {
    fontFamily: ButtonFont,
    fontSize: 20,
    color: mainAussieBlue,
    textAlign: "center",
  },
});
