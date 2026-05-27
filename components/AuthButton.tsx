import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";
import { clsx } from "clsx";
import { colors } from "@/constants/theme";

interface AuthButtonProps extends Omit<PressableProps, "children"> {
  label: string;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}

const AuthButton = ({
  label,
  loading = false,
  disabled = false,
  variant = "primary",
  ...pressableProps
}: AuthButtonProps) => {
  const isInactive = disabled || loading;
  const isSecondary = variant === "secondary";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive, busy: loading }}
      disabled={isInactive}
      {...pressableProps}
      className={clsx(
        isSecondary ? "auth-secondary-button" : "auth-button",
        !isSecondary && isInactive && "auth-button-disabled",
      )}
      style={({ pressed }) => (pressed && !isInactive ? { opacity: 0.85 } : null)}
    >
      {loading ? (
        <ActivityIndicator color={isSecondary ? colors.accent : colors.primary} />
      ) : (
        <Text className={isSecondary ? "auth-secondary-button-text" : "auth-button-text"}>
          {label}
        </Text>
      )}
    </Pressable>
  );
};

export default AuthButton;
