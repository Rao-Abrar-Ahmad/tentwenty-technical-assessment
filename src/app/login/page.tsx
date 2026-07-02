import React, { Suspense } from "react";
import LoginForm from "./_components/LoginForm";


export const metadata = {
  title: "Login - Timesheet Management",
  description: "Sign in to manage your weekly timesheets and log hours.",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col-reverse md:flex-row-reverse h-screen w-screen overflow-hidden bg-gray-50">
      {/* Left panel: Branding Banner */}
      <div className="hidden md:flex w-full h-full md:h-full md:w-1/2 bg-[#1C64F2] text-white flex flex-col justify-center p-8 md:p-16 transition-all duration-500">
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            ticktock
          </h1>
          <p className="text-[#E5E7EB] text-sm md:text-base leading-relaxed">
            Introducing ticktock, our cutting-edge timesheet web application designed to revolutionize how you manage employee work hours. With ticktock, you can effortlessly track and monitor employee attendance and productivity from anywhere, anytime, using any internet-connected device.
          </p>
        </div>
      </div>

      {/* Right panel: Login Form */}
      <div className="w-full h-full md:h-full md:w-1/2 bg-white flex flex-col justify-center p-8 sm:p-16 lg:p-24 overflow-y-auto">
        <div className="w-full max-w-md mx-auto space-y-8">
          <h1 className="block md:hidden text-center text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            ticktock
          </h1>
          <div className="mb-3">
            <h2 className="text-xl font-bold tracking-tight text-gray-900">
              Welcome back
            </h2>
          </div>

          <Suspense fallback={<div className="text-gray-500 text-sm">Loading login form...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
