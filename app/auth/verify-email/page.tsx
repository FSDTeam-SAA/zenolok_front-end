"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const OTP_LENGTH = 6;

export const dynamic = "force-dynamic";

function OtpInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const refs = React.useRef<Array<HTMLInputElement | null>>([]);
  const values = Array.from({ length: OTP_LENGTH }, (_, idx) => value[idx] ?? "");

  const setCharAt = (index: number, char: string) => {
    const chars = value.padEnd(OTP_LENGTH).split("");
    chars[index] = char;
    onChange(chars.join("").trimEnd());
  };

  return (
    <div className="flex items-center justify-center gap-3">
      {values.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          value={digit}
          onChange={(event) => {
            const text = event.target.value.replace(/\D/g, "");
            const char = text.slice(-1);
            setCharAt(index, char);
            if (char && index < OTP_LENGTH - 1) {
              refs.current[index + 1]?.focus();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !digit && index > 0) {
              refs.current[index - 1]?.focus();
            }
          }}
          className="font-poppins h-16 w-14 rounded-xl border border-[var(--ui-input-border)] bg-[var(--ui-input-bg)] text-center text-[40px] leading-[120%] font-semibold text-[var(--ui-input-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          inputMode="numeric"
          maxLength={1}
        />
      ))}
    </div>
  );
}

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = React.useState("");

  const verifyMutation = useMutation({
    mutationFn: async () => {
      if (!email) {
        throw new Error("Email is required");
      }

      if (otp.length !== OTP_LENGTH) {
        throw new Error("Please enter the 6-digit OTP");
      }

      return authApi.verifyEmail({ email, otp });
    },
    onSuccess: () => {
      toast.success("Email verified successfully");
      router.push("/auth/login");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Email verification failed");
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => {
      if (!email) {
        throw new Error("Email is required");
      }

      return authApi.resendOtp({ email });
    },
    onSuccess: () => {
      toast.success("OTP sent again");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to resend OTP");
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-[1180px] rounded-[42px] p-10 sm:p-16">
        <div className="mx-auto w-full max-w-[560px] py-16 text-center">
          <h1 className="fs-pop-60-bold text-[var(--text-strong)]">Verify Email</h1>
          <p className="fs-pop-20-medium-center mt-5 text-[var(--text-default)]">An OTP has been sent to your email address please verify it below</p>

          <div className="mt-8">
            <OtpInput value={otp} onChange={setOtp} />
          </div>

          <p className="fs-pop-16-regular mt-6 text-center text-[var(--text-default)]">
            Didn&apos;t Receive OTP?{" "}
            <button
              type="button"
              onClick={() => resendMutation.mutate()}
              className="font-semibold text-[var(--ui-btn-primary-bg)] hover:underline"
            >
              RESEND OTP
            </button>
          </p>

          <Button
            className="font-poppins mt-6 h-14 w-full text-[20px] leading-[120%] font-medium"
            onClick={() => verifyMutation.mutate()}
            disabled={verifyMutation.isPending}
          >
            {verifyMutation.isPending ? "Verifying..." : "Verify"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-[1180px] rounded-[42px] p-10 sm:p-16">
            <div className="mx-auto w-full max-w-[560px] py-16 text-center">
              <h1 className="fs-pop-60-bold text-[var(--text-strong)]">Verify Email</h1>
            </div>
          </Card>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
