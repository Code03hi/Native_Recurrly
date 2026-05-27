import { useAuth, useSignUp } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthBrand from "@/components/AuthBrand";
import AuthButton from "@/components/AuthButton";
import AuthInput from "@/components/AuthInput";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const CODE_LENGTH = 6;

type LocalErrors = {
  email?: string;
  password?: string;
  code?: string;
  form?: string;
};

const navigateAfterSignUp = (
  decorateUrl: (url: string) => string,
  push: (href: Href) => void,
) => {
  const url = decorateUrl("/");
  push(url as Href);
};

export default function SignUp() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const passwordRef = React.useRef<TextInput>(null);

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [localErrors, setLocalErrors] = React.useState<LocalErrors>({});

  const isFetching = fetchStatus === "fetching";

  const isVerifying =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  const fieldErrors: LocalErrors = React.useMemo(
    () => ({
      email: localErrors.email ?? errors.fields.emailAddress?.message,
      password: localErrors.password ?? errors.fields.password?.message,
      code: localErrors.code ?? errors.fields.code?.message,
      form: localErrors.form,
    }),
    [localErrors, errors],
  );

  const validateCredentials = () => {
    const next: LocalErrors = {};
    const trimmedEmail = emailAddress.trim();
    if (!trimmedEmail) {
      next.email = "Email is required";
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      next.email = "Enter a valid email address";
    }

    if (!password) {
      next.password = "Password is required";
    } else if (password.length < PASSWORD_MIN_LENGTH) {
      next.password = `Use at least ${PASSWORD_MIN_LENGTH} characters`;
    }
    setLocalErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateCode = () => {
    const trimmed = code.trim();
    const next: LocalErrors = {};
    if (!trimmed) {
      next.code = "Verification code is required";
    } else if (trimmed.length < CODE_LENGTH) {
      next.code = `Enter the ${CODE_LENGTH}-digit code we sent you`;
    }
    setLocalErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    Keyboard.dismiss();
    if (!validateCredentials()) return;

    const { error } = await signUp.password({
      emailAddress: emailAddress.trim(),
      password,
    });

    if (error) {
      setLocalErrors({
        form: error.message ?? "We couldn't create your account. Please try again.",
      });
      return;
    }

    await signUp.verifications.sendEmailCode();
    setCode("");
    setLocalErrors({});
  };

  const handleVerifyCode = async () => {
    Keyboard.dismiss();
    if (!validateCode()) return;

    await signUp.verifications.verifyEmailCode({ code: code.trim() });

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          navigateAfterSignUp(decorateUrl, router.replace);
        },
      });
    } else {
      setLocalErrors({
        form: "That code didn't match. Please try again.",
      });
    }
  };

  const handleResendCode = async () => {
    setLocalErrors({});
    await signUp.verifications.sendEmailCode();
  };

  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  const renderVerifyView = () => (
    <View className="auth-card">
      <View className="auth-form">
        <AuthInput
          label="Verification code"
          value={code}
          placeholder={`Enter your ${CODE_LENGTH}-digit code`}
          onChangeText={(value) => {
            setLocalErrors((prev) => ({ ...prev, code: undefined, form: undefined }));
            setCode(value.replace(/\D/g, "").slice(0, CODE_LENGTH));
          }}
          keyboardType="number-pad"
          autoFocus
          maxLength={CODE_LENGTH}
          error={fieldErrors.code}
          returnKeyType="done"
          onSubmitEditing={handleVerifyCode}
        />

        {fieldErrors.form ? (
          <Text className="auth-error" accessibilityLiveRegion="polite">
            {fieldErrors.form}
          </Text>
        ) : null}

        <AuthButton
          label="Verify email"
          onPress={handleVerifyCode}
          loading={isFetching}
          disabled={!code}
        />

        <AuthButton
          label="Send a new code"
          variant="secondary"
          onPress={handleResendCode}
          disabled={isFetching}
        />

        <Text className="auth-helper">
          We sent a code to {emailAddress.trim() || "your email"}. It can take a minute to arrive.
        </Text>
      </View>
    </View>
  );

  const renderCredentialsView = () => (
    <View className="auth-card">
      <View className="auth-form">
        <AuthInput
          label="Email"
          value={emailAddress}
          placeholder="Enter your email"
          onChangeText={(value) => {
            setLocalErrors((prev) => ({ ...prev, email: undefined, form: undefined }));
            setEmailAddress(value);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          keyboardType="email-address"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          error={fieldErrors.email}
        />

        <AuthInput
          ref={passwordRef}
          label="Password"
          value={password}
          placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
          onChangeText={(value) => {
            setLocalErrors((prev) => ({ ...prev, password: undefined, form: undefined }));
            setPassword(value);
          }}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password-new"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={handleSubmit}
          error={fieldErrors.password}
        />

        {fieldErrors.form ? (
          <Text className="auth-error" accessibilityLiveRegion="polite">
            {fieldErrors.form}
          </Text>
        ) : null}

        <AuthButton
          label="Create account"
          onPress={handleSubmit}
          loading={isFetching}
          disabled={!emailAddress || !password}
        />

        <View className="auth-link-row">
          <Text className="auth-link-copy">Already have an account?</Text>
          <Link href="/sign-in">
            <Text className="auth-link">Sign in</Text>
          </Link>
        </View>

        {/* Required for sign-up flows. Clerk's bot sign-up protection is enabled by default */}
        <View nativeID="clerk-captcha" />
      </View>
    </View>
  );

  return (
    <SafeAreaView className="auth-safe-area" edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        className="auth-screen"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-brand-block">
            <AuthBrand />
            <Text className="auth-title">
              {isVerifying ? "Verify your email" : "Create your account"}
            </Text>
            <Text className="auth-subtitle">
              {isVerifying
                ? "Enter the code we just sent to confirm your email."
                : "Start tracking your subscriptions in seconds."}
            </Text>
          </View>

          {isVerifying ? renderVerifyView() : renderCredentialsView()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
