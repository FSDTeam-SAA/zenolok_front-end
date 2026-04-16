"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { signIn } from "next-auth/react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRound } from "lucide-react";
import { toast } from "sonner";

import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (!result || result.error) {
        throw new Error(result?.error ?? "Unable to login");
      }

      return result;
    },
    onSuccess: () => {
      toast.success("Logged in successfully");
      router.push("/home");
      router.refresh();
    },
    onError: (error: Error) => {
      if (error.message.toLowerCase().includes("not verified")) {
        const email = form.getValues("email");
        if (email) {
          toast.error("Your account is not verified. Please verify your email.");
          router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
          return;
        }
      }

      toast.error(error.message || "Login failed");
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-8">
      <div className="auth-shell relative w-full max-w-[1172px] overflow-hidden rounded-[40px] border lg:h-[777.9995px]">
        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          <div className="auth-split-panel absolute left-0 top-0 h-[777.9995px] w-[696.5px]" style={{ clipPath: "polygon(0 0, 100% 0, 68% 100%, 0 100%)" }} />
          <div className="auth-split-panel absolute right-0 top-0 h-[777.9995px] w-[696.5px]" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 32% 100%)" }} />
          <div className="auth-split-glass absolute left-4/5 top-0 h-[777.9995px] w-[696.5px] -translate-x-1/2 skew-x-[165deg]" />
        </div>

        <div className="relative z-10 grid h-full lg:grid-cols-2">
          <div className="flex items-center justify-center px-5 py-10 text-center sm:px-10">
            <div className="w-full max-w-[500px]">
              <h1 className="fs-pop-60-bold text-[var(--text-strong)]">Welcome Back!</h1>
              <p className="font-poppins mx-auto mt-8 max-w-[430px] text-[22px] leading-[1.2] font-semibold text-[var(--text-default)]">To keep connected with us please login with your personal info</p>
            </div>
          </div>

          <div className="flex items-center justify-center px-5 py-10 sm:px-10">
            <div className="w-full max-w-[468px]">
              <div className="mb-8 text-center">
                <h2 className="fs-pop-60-bold text-[var(--text-strong)]">Login</h2>
                <p className="font-poppins mt-7 text-[20px] font-normal text-[var(--text-default)]">Use your username for login</p>
              </div>

              <form className="space-y-[18px]" onSubmit={form.handleSubmit(onSubmit)}>
                <div>
                  <div className="relative">
                    <Input
                      placeholder="User Email"
                      {...form.register("email")}
                      className="h-[56px] rounded-[4px] border-[var(--ui-input-border)] bg-transparent pr-12 font-poppins !text-[24px] text-[var(--text-default)] placeholder:text-[24px] placeholder:text-[var(--ui-input-placeholder)]"
                    />
                    <UserRound className="pointer-events-none absolute right-4 top-1/2 size-6 -translate-y-1/2 text-[var(--ui-input-placeholder)]" />
                  </div>
                  {form.formState.errors.email ? <p className="mt-1 text-xs text-red-500">{form.formState.errors.email.message}</p> : null}
                </div>

                <div>
                  <Controller
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <PasswordInput
                        placeholder="Password"
                        className="h-[56px] rounded-[4px]"
                        inputClassName="h-[56px] rounded-[4px] border-[var(--ui-input-border)] bg-transparent font-poppins !text-[24px] text-[var(--text-default)] placeholder:text-[24px]placeholder:text-[var(--ui-input-placeholder)]"
                        {...field}
                      />
                    )}
                  />
                  {form.formState.errors.password ? <p className="mt-1 text-xs text-red-500">{form.formState.errors.password.message}</p> : null}
                </div>

                <Link className="font-poppins block text-center text-[20px] font-normal text-[var(--text-default)] hover:underline" href="/auth/forgot-password">
                  Forgot Password?
                </Link>

                <Button type="submit" className="font-poppins h-[56px] w-full rounded-[8px] text-[18px] font-medium" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? "Logging in..." : "Login"}
                </Button>

                <p className="font-poppins text-center text-[15px] text-[var(--text-muted)]">
                  New here?{" "}
                  <Link href="/auth/register" className="font-semibold text-[var(--ui-btn-primary-bg)] hover:underline">
                    Create account
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
