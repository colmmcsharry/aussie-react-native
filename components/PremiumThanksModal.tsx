import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
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
  const tiltAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(tiltAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(tiltAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [visible, tiltAnim]);

  const tiltLeft = tiltAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "25deg"],
  });
  const tiltRight = tiltAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "-25deg"],
  });

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
            <PremiumCrown size={43} />
            <MaterialCommunityIcons
              name="check-decagram-outline"
              size={38}
              color={CROWN_GOLD}
            />
          </View>
          <Text style={styles.text}>
            {"You've got the Premium version. Cheers for supporting the app!"}
          </Text>
          <View style={styles.pintsRow}>
            <Animated.View
              style={[styles.pintWrap, { transform: [{ rotate: tiltLeft }] }]}
            >
              <Image
                source={require("@/assets/pint.png")}
                style={styles.pintImage}
                resizeMode="contain"
              />
            </Animated.View>
            <Animated.View
              style={[styles.pintWrap, { transform: [{ rotate: tiltRight }] }]}
            >
              <Image
                source={require("@/assets/pint.png")}
                style={[styles.pintImage, styles.pintImageFlipped]}
                resizeMode="contain"
              />
            </Animated.View>
          </View>
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
    marginBottom: 16,
  },
  pintsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  pintWrap: {
    paddingBottom: 2,
  },
  pintImage: {
    width: 40,
    height: 40,
  },
  pintImageFlipped: {
    transform: [{ scaleX: -1 }],
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
