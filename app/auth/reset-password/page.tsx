"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { authApi } from "@/lib/api";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const schema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof schema>;

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") ?? "";
  const otp = searchParams.get("otp") ?? "";

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (values: ResetPasswordValues) =>
      authApi.resetPassword({
        email,
        otp,
        newPassword: values.password,
      }),
    onSuccess: () => {
      toast.success("Password reset successfully");
      router.push("/auth/login");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reset password");
    },
  });

  const missingParams = !email || !otp;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-[1180px] rounded-[42px] p-10 sm:p-16">
        <div className="mx-auto w-full max-w-[560px] py-16 text-center">
          <h1 className="fs-pop-60-bold text-[var(--text-strong)]">Reset Password</h1>
          <p className="fs-pop-20-medium-center mt-5 text-[var(--text-default)]">Please kindly set your new password</p>

          {missingParams ? (
            <div className="auth-alert-error mt-8 rounded-xl border p-4 text-left">
              Missing reset session. Please request OTP again.
            </div>
          ) : null}

          <form className="mt-8 space-y-6" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <div>
              <PasswordInput placeholder="New Password" className="h-14" inputClassName="fs-pop-16-regular h-14" {...form.register("password")} />
              {form.formState.errors.password ? (
                <p className="mt-1 text-left text-sm text-[#EA4335]">{form.formState.errors.password.message}</p>
              ) : null}
            </div>

            <div>
              <PasswordInput
                placeholder="Confirm Password"
                className="h-14"
                inputClassName="fs-pop-16-regular h-14"
                {...form.register("confirmPassword")}
              />
              {form.formState.errors.confirmPassword ? (
                <p className="mt-1 text-left text-sm text-[#EA4335]">{form.formState.errors.confirmPassword.message}</p>
              ) : null}
            </div>

            <Button className="font-poppins h-14 w-full text-[20px] leading-[120%] font-medium" disabled={mutation.isPending || missingParams}>
              {mutation.isPending ? "Saving..." : "Continue"}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-[1180px] rounded-[42px] p-10 sm:p-16">
            <div className="mx-auto w-full max-w-[560px] py-16 text-center">
              <h1 className="fs-pop-60-bold text-[var(--text-strong)]">Reset Password</h1>
            </div>
          </Card>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
