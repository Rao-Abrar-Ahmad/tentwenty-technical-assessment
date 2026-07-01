import React, { Suspense } from "react";
import LoginForm from "./_components/LoginForm";


export const metadata = {
  title: "Login - Timesheet Management",
  description: "Sign in to manage your weekly timesheets and log hours.",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col md:flex-row-reverse h-screen w-screen overflow-hidden bg-gray-50">
      {/* Left panel: Branding Banner */}
      <div className="w-full h-1/3 md:h-full md:w-1/2 bg-[#1C64F2] text-white flex flex-col justify-center p-8 md:p-16 lg:p-24 transition-all duration-500">
        <div className="max-w-md space-y-4">
          <div className="inline-flex items-center space-x-2 bg-blue-500/25 px-3 py-1 rounded-full text-sm font-semibold tracking-wide backdrop-blur-sm border border-white/10">
            <span>✨ Version 1.0</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Timesheet Management
          </h1>
          <p className="text-blue-100 text-sm md:text-base lg:text-lg leading-relaxed">
            Keep track of your weekly tasks, log your project hours, and manage your progress effortlessly in one place.
          </p>
        </div>
      </div>

      {/* Right panel: Login Form */}
      <div className="w-full h-2/3 md:h-full md:w-1/2 bg-white flex flex-col justify-center p-8 sm:p-16 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
              Welcome back
            </h2>
            <p className="text-sm text-gray-500">
              Enter your credentials to access your timesheets dashboard.
            </p>
          </div>

          <Suspense fallback={<div className="text-gray-500 text-sm">Loading login form...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
