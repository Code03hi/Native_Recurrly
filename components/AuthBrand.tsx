import { View, Text } from "react-native";

const AuthBrand = () => {
  return (
    <View className="auth-logo-wrap">
      <View className="auth-logo-mark">
        <Text className="auth-logo-mark-text">R</Text>
      </View>
      <View>
        <Text className="auth-wordmark">Recurrly</Text>
        <Text className="auth-wordmark-sub">Smart Billing</Text>
      </View>
    </View>
  );
};

export default AuthBrand;
