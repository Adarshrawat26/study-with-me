import { Suspense } from "react";
import SignInPage from "./page.client";
import { isGoogleAuthConfigured } from "@/lib/google-auth";

export default function SignIn() {
  const googleEnabled = isGoogleAuthConfigured();

  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center">Loading...</div>}>
      <SignInPage googleEnabled={googleEnabled} />
    </Suspense>
  );
}
