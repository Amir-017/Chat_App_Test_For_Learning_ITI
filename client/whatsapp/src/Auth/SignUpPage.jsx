import { SignUp } from '@clerk/react';

export const SignUpPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_30%),linear-gradient(180deg,#02040d_0%,#070b18_100%)]">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.12),transparent_25%),radial-gradient(circle_at_80%_10%,rgba(16,185,129,0.14),transparent_22%)]" />
      <div className="relative">
        <SignUp
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/chat"
          appearance={{ variables: { colorPrimary: '#10b981' } }}
        />
      </div>
    </div>
  );
};
