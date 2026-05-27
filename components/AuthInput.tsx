import { forwardRef } from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";
import { clsx } from "clsx";
import { colors } from "@/constants/theme";

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
}

const AuthInput = forwardRef<TextInput, AuthInputProps>(
  ({ label, error, ...textInputProps }, ref) => {
    return (
      <View className="auth-field">
        <Text className="auth-label">{label}</Text>
        <TextInput
          ref={ref}
          placeholderTextColor={colors.mutedForeground}
          className={clsx("auth-input", error && "auth-input-error")}
          {...textInputProps}
        />
        {error ? <Text className="auth-error">{error}</Text> : null}
      </View>
    );
  },
);

AuthInput.displayName = "AuthInput";

export default AuthInput;
