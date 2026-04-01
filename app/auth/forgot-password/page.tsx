"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { toast } from "sonner";

import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type ForgotPasswordValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  const mutation = useMutation({
    mutationFn: authApi.forgetPassword,
    onSuccess: (_, values) => {
      toast.success("OTP sent to your email");
      router.push(`/auth/verify-otp?email=${encodeURIComponent(values.email)}&type=reset`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send OTP");
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-[1180px] rounded-[42px] p-10 sm:p-16">
        <div className="mx-auto w-full max-w-[560px] py-16 text-center">
          <h1 className="fs-pop-60-bold text-[var(--text-strong)]">Forgot Password</h1>
          <p className="fs-pop-20-medium-center mt-5 text-[var(--text-default)]">Enter your email to receive the OTP</p>

          <form className="mt-8 space-y-6" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <div>
              <div className="relative">
                <Input placeholder="Email Address" className="fs-pop-16-regular h-14 pr-12" {...form.register("email")} />
                <Mail className="pointer-events-none absolute top-1/2 right-4 size-6 -translate-y-1/2 text-[var(--ui-input-placeholder)]" />
              </div>
              {form.formState.errors.email ? (
                <p className="mt-1 text-left text-sm text-[#EA4335]">{form.formState.errors.email.message}</p>
              ) : null}
            </div>

            <Button className="font-poppins h-14 w-full text-[20px] leading-[120%] font-medium" disabled={mutation.isPending}>
              {mutation.isPending ? "Sending..." : "Send OTP"}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
