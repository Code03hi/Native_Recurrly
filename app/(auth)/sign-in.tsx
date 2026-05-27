import { useSignIn } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import React from "react";
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthBrand from "@/components/AuthBrand";
import AuthButton from "@/components/AuthButton";
import AuthInput from "@/components/AuthInput";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_LENGTH = 6;

type LocalErrors = {
  email?: string;
  password?: string;
  code?: string;
  form?: string;
};

const navigateAfterSignIn = (
  decorateUrl: (url: string) => string,
  push: (href: Href) => void,
) => {
  const url = decorateUrl("/");
  push(url as Href);
};

export default function SignIn() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const passwordRef = React.useRef<TextInput>(null);

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [localErrors, setLocalErrors] = React.useState<LocalErrors>({});

  const isFetching = fetchStatus === "fetching";
  const needsClientTrust = signIn.status === "needs_client_trust";

  const fieldErrors: LocalErrors = React.useMemo(
    () => ({
      email: localErrors.email ?? errors.fields.identifier?.message,
      password: localErrors.password ?? errors.fields.password?.message,
      code: localErrors.code ?? errors.fields.code?.message,
      form: localErrors.form,
    }),
    [localErrors, errors],
  );

  const validateCredentials = () => {
    const next: LocalErrors = {};
    if (!emailAddress.trim()) {
      next.email = "Email is required";
    } else if (!EMAIL_REGEX.test(emailAddress.trim())) {
      next.email = "Enter a valid email address";
    }
    if (!password) {
      next.password = "Password is required";
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

    const { error } = await signIn.password({
      emailAddress: emailAddress.trim(),
      password,
    });

    if (error) {
      setLocalErrors({ form: error.message ?? "Couldn't sign you in. Please try again." });
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          navigateAfterSignIn(decorateUrl, router.replace);
        },
      });
    } else if (signIn.status === "needs_client_trust") {
      const emailCodeFactor = signIn.supportedSecondFactors.find(
        (factor) => factor.strategy === "email_code",
      );
      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
        setCode("");
        setLocalErrors({});
      }
    } else {
      setLocalErrors({
        form: "We couldn't complete sign-in. Please try again.",
      });
    }
  };

  const handleVerifyCode = async () => {
    Keyboard.dismiss();
    if (!validateCode()) return;

    await signIn.mfa.verifyEmailCode({ code: code.trim() });

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) return;
          navigateAfterSignIn(decorateUrl, router.replace);
        },
      });
    } else {
      setLocalErrors({
        form: "We couldn't verify that code. Please try again.",
      });
    }
  };

  const handleResendCode = async () => {
    setLocalErrors({});
    await signIn.mfa.sendEmailCode();
  };

  const handleStartOver = () => {
    setCode("");
    setPassword("");
    setLocalErrors({});
    signIn.reset();
  };

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
          label="Verify"
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

        <View className="auth-link-row">
          <Text className="auth-link-copy">Wrong account?</Text>
          <Text className="auth-link" onPress={handleStartOver}>
            Start over
          </Text>
        </View>
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
          placeholder="Enter your password"
          onChangeText={(value) => {
            setLocalErrors((prev) => ({ ...prev, password: undefined, form: undefined }));
            setPassword(value);
          }}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
          textContentType="password"
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
          label="Sign in"
          onPress={handleSubmit}
          loading={isFetching}
          disabled={!emailAddress || !password}
        />

        <View className="auth-link-row">
          <Text className="auth-link-copy">New to Recurrly?</Text>
          <Link href="/sign-up">
            <Text className="auth-link">Create an account</Text>
          </Link>
        </View>
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
              {needsClientTrust ? "Verify your account" : "Welcome back"}
            </Text>
            <Text className="auth-subtitle">
              {needsClientTrust
                ? "We sent a verification code to your email. Enter it below to continue."
                : "Sign in to continue managing your subscriptions"}
            </Text>
          </View>

          {needsClientTrust ? renderVerifyView() : renderCredentialsView()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
